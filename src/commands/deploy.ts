import glob from 'glob'
import fs from 'fs'
import { gitIgnoreToGlob } from '../util/ignoreToGlob.js'
import install from './install.js'
import { domainGetConnection, domainMigrate } from '../util/domain.js'
import { packageGet } from '../util/package.js'
import { packageVersionGet, packageVersionCreate, packageVersionPathGetLatestPath } from '../util/package-version.js'
import { getPackageConfig } from '../util/config.js'
import { applyTransforms } from '../util/transform.js'
import AdmZip from 'adm-zip'

const GLOB = '**/*'
const IGNORE = [
  'node_modules/**/*', '.git/**/*', '*.secret.js', '*.secret.mjs', 'package-lock.json', 'yarn.lock'
]

function getIgnore () {
  return IGNORE
    .concat(gitIgnoreToGlob())
    .concat(gitIgnoreToGlob('.truffleignore'))
    // gitignoreToGlob starts with ! so it's double negative (we don't want)
    .map((ignore) => ignore.replace('!', ''))
}

export async function deploy ({ shouldUpdateDomain }: { shouldUpdateDomain?: boolean }) {
  const packageVersion = await packageVersionGet()
  let fromPackageVersionId = packageVersion?.id
  // `installActionRel` and `requestedPermissions` need to default to a truthy value
  // so that they are set in the db when a dev removes them from their config.
  const { version, installActionRel = {}, requestedPermissions = [] } = (await getPackageConfig())!
  const pkg = await packageGet()

  console.log('Bundling...');

  const zip = new AdmZip()
  const filenames = await new Promise((resolve, reject) =>
    glob(GLOB, { ignore: getIgnore(), nodir: true }, async (err, filenames) => {
      err ? reject(err) : resolve(filenames)
    }))
  filenames.forEach((filename) => {
    const code = applyTransforms(filename, fs.readFileSync(filename).toString())
    zip.addFile(filename, Buffer.from(code))
  })

  // const packageVersionUpsert = packageVersionId ? packageVersionUpdate : packageVersionCreate
  const packageVersionUpsert = packageVersionCreate // FIXME
  fromPackageVersionId = pkg.latestPackageVersionId

  console.log('Uploading...');

  const upsertedPackageVersion = await packageVersionUpsert({
    packageId: pkg.id,
    semver: version,
    installActionRel,
    requestedPermissions
  }, zip.toBuffer())
  const packageVersionId = upsertedPackageVersion.id

  if (shouldUpdateDomain && fromPackageVersionId !== packageVersionId) {
    console.log(`Updating domains to ${packageVersionId}`)
    const domains = await domainMigrate({ packageId: pkg.id, toPackageVersionId: packageVersionId })
    console.log('Domains updated', domains)
  }
  const domainConnection = await domainGetConnection({ packageVersionId })
  const domainsStr = domainConnection.nodes
    .map(({ domainName }) => `https://${domainName}`).join(', ') || 'no domain'
  console.log(`Deployed to ${domainsStr}`)
  const latestPackageVersionPath = await packageVersionPathGetLatestPath()
  await install({
    installedPackageVersionPath: latestPackageVersionPath,
    isForceInstall: true
  })
}
