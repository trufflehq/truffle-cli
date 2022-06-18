import watchGlob from 'watch-glob'
import glob from 'glob'
import fs from 'fs'
import gitignoreToGlob from 'gitignore-to-glob'

import { domainMigrate } from './util/domain.js'
import { moduleUpsert } from './util/module.js'
import { packageGet } from './util/package.js'
import { routeUpsert } from './util/route.js'
import { routerUpsert } from './util/router.js'
import { packageVersionGet, packageVersionIncrement } from './util/package-version.js'

const GLOB = '**/*'
const IGNORE = [
  'node_modules/**/*', '.git/**/*', '*.secret.js', 'package.json', 'package-lock.json', 'yarn.lock'
]

function getIgnore () {
  // gitignoreToGlob starts with ! so it's double negative (we don't want)
  return IGNORE.concat(gitignoreToGlob()).map((ignore) => ignore.replace('!', ''))
}

export async function deploy ({ shouldUpdateDomain } = {}) {
  const packageVersion = await packageVersionGet()
  let packageVersionId = packageVersion?.id
  let incrementedPackageVersion
  if (!packageVersionId) {
    const pkg = await packageGet()
    packageVersionId = pkg.latestPackageVersionId
    console.log('New package version, creating...')
    console.log(pkg)
    incrementedPackageVersion = await packageVersionIncrement({ fromId: packageVersionId })
    packageVersionId = incrementedPackageVersion.id
    console.log('New version created')
  }
  await glob(GLOB, { ignore: getIgnore(), nodir: true }, async (err, filenames) => {
    if (err) throw err
    for (const filename of filenames) {
      await handleFilename(filename, { packageVersionId })
    }
    if (shouldUpdateDomain && incrementedPackageVersion) {
      console.log('Updating domains')
      const domains = await domainMigrate({ fromPackageVersionId: packageVersionId, toPackageVersionId: incrementedPackageVersion.id })
      console.log('Domains updated', domains)
    }
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

  const code = fs.readFileSync(filename).toString()

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

async function saveRoute ({ filenameParts, module, packageVersionId }) {
  const defaultExportComponentId = module.exports.find(({ type }) => type === 'default')?.componentRel?.id

  const filenamePath = `/${filenameParts.slice(1, filenameParts.length - 1).join('/')}`
  const pathParts = filenamePath.split('/')
  const routerBases = pathParts.map((routerPath, i) => `${pathParts.slice(0, i + 1).join('/')}`)
  console.log('bases', routerBases)
  let prevRouter
  // create a top level router and another router for any folders w/ layout.tsx
  await Promise.all(routerBases.map(async (routerBase, i) => {
    const parent = prevRouter
    // FIXME: support .ts|.jsx|.js too
    const layoutFilename = `/routes${routerBase}/layout.tsx`
    console.log('check', layoutFilename)
    let hasLayoutFile, code
    try {
      code = fs.readFileSync(`.${layoutFilename}`).toString()
      hasLayoutFile = true
    } catch {}

    let layoutDefaultExportComponentId
    if (hasLayoutFile) {
      console.log('has layout')
      const layoutModule = await moduleUpsert({
        packageVersionId,
        filename: layoutFilename,
        code
      })
      layoutDefaultExportComponentId = layoutModule.exports.find(({ type }) => type === 'default')?.componentRel?.id
      console.log('exp', layoutDefaultExportComponentId)
    }

    if (hasLayoutFile || !prevRouter) {
      prevRouter = await routerUpsert({
        packageVersionId,
        parentId: parent?.id,
        base: routerBase,
        componentId: layoutDefaultExportComponentId
      })
    }
  }))

  await routeUpsert({
    packageVersionId,
    routerId: prevRouter.id,
    pathWithVariables: `/${filenameParts.slice(1, filenameParts.length - 1).join('/')}`,
    componentId: defaultExportComponentId
  })
}
