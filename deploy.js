import watchGlob from 'watch-glob'
import glob from 'glob'
import fs from 'fs'
import chalk from 'chalk'
import gitignoreToGlob from 'gitignore-to-glob'
import install from './install.js'
import { domainGetConnection, domainMigrate } from './util/domain.js'
import { moduleUpsert } from './util/module.js'
import { packageGet } from './util/package.js'
import { saveRoute } from './util/route.js'
import { packageVersionGet, packageVersionCreate, packageVersionUpdate, packageVersionPathGetLatest } from './util/package-version.js'
import { getPackageConfig } from './util/config.js'
import { applyTransforms } from './util/transform.js'

const GLOB = '**/*'
const IGNORE = [
  'node_modules/**/*', '.git/**/*', '*.secret.js', '*.secret.mjs', 'package-lock.json', 'yarn.lock'
]

function areEqual (array1, array2) {
  if (array1.length === array2.length) {
    return array1.every(element => {
      if (array2.includes(element)) {
        return true
      }

      return false
    })
  }

  return false
}

function getIgnore () {
  // gitignoreToGlob starts with ! so it's double negative (we don't want)
  return IGNORE.concat(gitignoreToGlob()).map((ignore) => ignore.replace('!', ''))
}

export async function deploy ({ shouldUpdateDomain } = {}) {
  const packageVersion = await packageVersionGet()
  let packageVersionId = packageVersion?.id
  let fromPackageVersionId = packageVersionId
  let incrementedPackageVersion
  const { version, installActionRel, requestedPermissions } = await getPackageConfig()
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
  } else if (
    !areEqual(packageVersion?.requestedPermissions ?? [], requestedPermissions ?? []) ||
    !areEqual(packageVersion?.installActionRel ?? [], installActionRel ?? [])
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
    for (const filename of filenames) {
      await handleFilename(filename, { packageVersionId })
    }
    if (shouldUpdateDomain && fromPackageVersionId !== packageVersionId) {
      console.log(`Updating domains from ${fromPackageVersionId} to ${packageVersionId}`)
      const domains = await domainMigrate({ fromPackageVersionId, toPackageVersionId: packageVersionId })
      console.log('Domains updated', domains)
    }
    const domainConnection = await domainGetConnection({ packageVersionId })
    const domainsStr = domainConnection.nodes
      .map(({ domainName }) => `https://${domainName}`).join(', ') || 'no domain'
    console.log(`Deployed to ${domainsStr}`)
    const latestPackageVersionPath = await packageVersionPathGetLatest()
    await install({
      installedPackageVersionPath: latestPackageVersionPath,
      isForceInstall: true
    })
  })
}

export async function watch () {
  const packageVersion = await packageVersionGet()
  const packageVersionId = packageVersion?.id
  watchGlob([GLOB], { ignore: getIgnore(), nodir: true, callbackArg: 'relative' }, (filename) => {
    handleFilename(filename, { packageVersionId })
  })
  console.log('Listening for changes...')
}

async function handleFilename (filename, { packageVersionId }) {
  console.log('File changed:', filename)
  if (filename.indexOf('.secret.js') !== -1) {
    console.log('skipping secret file')
  }

  const code = applyTransforms(filename, fs.readFileSync(filename).toString())

  try {
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
  } catch (err) {
    console.log('failed upsert for', filename, err)
  }
}
