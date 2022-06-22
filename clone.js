import fs from 'fs'
import path from 'path'

import { getPackageConfig, getGlobalConfig } from './util/config.js'
import { packageVersionGet } from './util/package-version.js'

export default async function clone (options = {}) {
  const { apiUrl, secretKey } = await getPackageConfig() || getGlobalConfig()
  const { packageVersionId, combinedPackageSlug, toPackageSlug, shouldCreateConfigFile } = options
  const packageVersion = await packageVersionGet({ id: packageVersionId, combinedPackageSlug })

  let packagePath = path.resolve('./', toPackageSlug || packageVersion.package.slug)
  try {
    fs.mkdirSync(packagePath)
  } catch (err) {
    console.log('Directory exists')
    packagePath = `${packagePath}-${Date.now()}`
  }

  packageVersion.moduleConnection.nodes.forEach((module) => {
    const filename = `${packagePath}${module.filename}`
    fs.mkdirSync(path.dirname(filename), { recursive: true })
    fs.writeFileSync(path.resolve(filename), module.code)
  })

  if (shouldCreateConfigFile) {
    const configFilename = `${packagePath}/truffle.config.mjs`
    fs.writeFileSync(configFilename, `export default {
  name: '@${packageVersion.package.org.slug}/${packageVersion.package.slug}',
  version: '${packageVersion.semver}',
  apiUrl: '${apiUrl}'
}`)
    const secretFilename = `${packagePath}/truffle.secret.mjs`
    fs.writeFileSync(secretFilename, `export default {
  secretKey: '${secretKey}'
}`)
    const gitignoreFilename = `${packagePath}/.gitignore`
    fs.writeFileSync(gitignoreFilename, 'truffle.secret.*')
  }

  console.log(`Created, now you can cd into ${packagePath}`)
  console.log(`You can also access this package at: https://package-version-${packageVersion.id}.sporocarp.dev`)
}
