import fs from 'fs'
import path from 'path'

import { getPackageConfig, getGlobalConfig } from './util/config.js'
import { packageVersionGet } from './util/package-version.js'

export default async function clone (options = {}) {
  const { apiUrl } = await getPackageConfig() || getGlobalConfig()
  const { packageVersionId, packagePath, toPackageSlug, shouldCreateConfigFile, secretKey } = options
  const packageVersion = await packageVersionGet({ id: packageVersionId, packagePath })

  let toPath = path.resolve('./', toPackageSlug || packageVersion.package.slug)
  try {
    fs.mkdirSync(toPath)
  } catch (err) {
    console.log('Directory exists')
    toPath = `${toPath}-${Date.now()}`
  }

  packageVersion.moduleConnection.nodes.forEach((module) => {
    const filename = `${toPath}${module.filename}`
    fs.mkdirSync(path.dirname(filename), { recursive: true })
    fs.writeFileSync(path.resolve(filename), module.code)
  })

  if (shouldCreateConfigFile) {
    const configFilename = `${toPath}/truffle.config.mjs`
    fs.writeFileSync(configFilename, `export default {
  name: '@${packageVersion.package.org.slug}/${packageVersion.package.slug}',
  version: '${packageVersion.semver}',
  apiUrl: '${apiUrl}'
}`)
    const secretFilename = `${toPath}/truffle.secret.mjs`
    fs.writeFileSync(secretFilename, `export default {
  secretKey: '${secretKey}'
}`)
    const gitignoreFilename = `${toPath}/.gitignore`
    fs.writeFileSync(gitignoreFilename, 'truffle.secret.*')
  }

  console.log(`Created, now you can cd into ${toPath}`)
  console.log(`You can also access this package at: https://package-version-${packageVersion.id}.sporocarp.dev`)
}
