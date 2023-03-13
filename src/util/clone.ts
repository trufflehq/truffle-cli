import fs from 'fs'
import path from 'path'
import prettier from 'prettier'

import { getPackageConfig, getOrgProfileConfig, getApiUrl } from './config.js'
import { packageVersionGet } from './package-version.js'
import { deepOmit } from './deep-omit.js'

export default async function clone (options: {
    packageVersionId?: string
    toPackageSlug?: string
    toPath?: string
    shouldCreateConfigFile?: boolean
    shouldCreateFrontendFiles?: boolean
    shouldCreateDir?: boolean
    secretKey?: string
    packagePath?: string
  }) {
  const apiUrl = (await getPackageConfig())?.apiUrl || getApiUrl() || (getOrgProfileConfig())?.apiUrl
  const {
    packageVersionId,
    packagePath,
    toPackageSlug,
    shouldCreateConfigFile,
    shouldCreateFrontendFiles = true,
    shouldCreateDir = true,
    secretKey
  } = options
  let { toPath } = options
  const packageVersion = await packageVersionGet({ id: packageVersionId, packagePath })

  // the directory will either be toPath, toPackageSlug, or the package slug
  toPath ??= path.resolve('./', toPackageSlug || packageVersion.package.slug)

  if (shouldCreateDir) {
    try {
      fs.mkdirSync(toPath)
    } catch (err) {
      console.log('Directory exists')
      toPath = `${toPath}-${Date.now()}`
    }
  }

  if (shouldCreateFrontendFiles) {
    packageVersion.moduleConnection.nodes.forEach((module) => {
      const filename = `${toPath}${module.filename}`
      fs.mkdirSync(path.dirname(filename), { recursive: true })
      fs.writeFileSync(path.resolve(filename), module.code)
    })
  }

  if (shouldCreateConfigFile) {
    const configFilename = `${toPath}/truffle.config.mjs`
    fs.writeFileSync(configFilename, prettier.format(`export default {
  name: '@${packageVersion.package.org.slug}/${packageVersion.package.slug}',
  version: '${packageVersion.semver}',
  apiUrl: '${apiUrl}',
  requestedPermissions: ${JSON.stringify(packageVersion.requestedPermissions ? packageVersion.requestedPermissions : [])},
  installActionRel: ${JSON.stringify(packageVersion.installActionRel ? deepOmit(packageVersion.installActionRel, 'actionId') : {})}
}`, { semi: false, parser: 'babel' }))
    const secretFilename = `${toPath}/truffle.secret.mjs`
    fs.writeFileSync(secretFilename, `export default {
  secretKey: '${secretKey}'
}`)
    const gitignoreFilename = `${toPath}/.gitignore`
    fs.writeFileSync(gitignoreFilename, 'truffle.secret.*')
  }

  console.log(`Wrote files to ${toPath}`)
}
