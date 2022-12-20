import glob from 'glob'
import fs from 'fs'
import chalk from 'chalk'
import pMap from 'p-map'
import { gitIgnoreToGlob } from '../util/ignoreToGlob.js'
import install from './install.js'
import { domainGetConnection, domainMigrate } from '../util/domain.js'
import { moduleUpsert } from '../util/module.js'
import { packageGet } from '../util/package.js'
import { saveRoute } from '../util/route.js'
import { packageVersionGet, packageVersionCreate, packageVersionUpdate, packageVersionPathGetLatestPath } from '../util/package-version.js'
import { getPackageConfig } from '../util/config.js'
import { applyTransforms } from '../util/transform.js'
import _ from 'lodash'

const GLOB = '**/*'
const IGNORE = [
  'node_modules/**/*', '.git/**/*', '*.secret.js', '*.secret.mjs', 'package-lock.json', 'yarn.lock'
]
const FILE_UPLOAD_CONCURRENCY = 40

function getIgnore () {
  return IGNORE
    .concat(gitIgnoreToGlob())
    .concat(gitIgnoreToGlob('.truffleignore'))
    // gitignoreToGlob starts with ! so it's double negative (we don't want)
    .map((ignore) => ignore.replace('!', ''))
}

export async function deploy ({ shouldUpdateDomain }: { shouldUpdateDomain?: boolean }) {
  const packageVersion = await packageVersionGet()
  let packageVersionId = packageVersion?.id
  let fromPackageVersionId = packageVersionId
  let incrementedPackageVersion
  // `installActionRel` and `requestedPermissions` need to default to a truthy value
  // so that they are set in the db when a dev removes them from their config.
  const { version, installActionRel = {}, requestedPermissions = [] } = (await getPackageConfig())!
  const pkg = await packageGet()
  if (!packageVersionId) {
    fromPackageVersionId = pkg.latestPackageVersionId
    console.log('New package version, creating...')
    console.log(pkg)
    incrementedPackageVersion = await packageVersionCreate({
      packageId: pkg.id,
      semver: version,
      installActionRel,
      requestedPermissions
    })
    packageVersionId = incrementedPackageVersion.id
    console.log('New version created', packageVersionId)
  } else if (!_.isEqual(packageVersion?.requestedPermissions, requestedPermissions) ||
        !_.isEqual(packageVersion?.installActionRel, installActionRel)
  ) {
    console.log(chalk.yellowBright.bold('Updating package version config'))
    await packageVersionUpdate({
      packageId: pkg.id,
      semver: version,
      installActionRel,
      requestedPermissions
    })
  }

  await glob(GLOB, { ignore: getIgnore(), nodir: true }, async (err, filenames) => {
    if (err) throw err
    const totalFiles = filenames.length
    let savedCount = 0
    await pMap(filenames, async (filename) => {
      await handleFilename(filename, { packageVersionId })
      console.log(`${++savedCount} / ${totalFiles}`)
    }, { concurrency: FILE_UPLOAD_CONCURRENCY })
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

    console.log('Publishing package version')
    await packageVersionUpdate({
      packageId: pkg.id,
      semver: version,
      status: 'published'
    })
  })
}

async function handleFilename (filename, { packageVersionId }) {
  if (filename.indexOf('.secret.js') !== -1) {
    console.log('skipping secret file')
  }

  const code = applyTransforms(filename, fs.readFileSync(filename).toString())

  const module = await moduleUpsert({
    packageVersionId,
    filename: `/${filename}`,
    code
  })

  const filenameParts = filename.split('/')
  const isLayoutFile = filename.indexOf('layout.tsx') !== -1
  if (filenameParts[0] === 'routes' && !isLayoutFile) {
    saveRoute({ filenameParts, module, packageVersionId })
  }

  console.log(`Saved ${filename}`)
}
