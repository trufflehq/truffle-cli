import fs from 'fs'
import path from 'path'
import os from 'os'
import chalk from 'chalk'

export function getConfigFilename (fiename) {
  return path.resolve(os.homedir(), path.normalize('.truffle/config.json'))
}

export function getGlobalConfig () {
  return JSON.parse(fs.readFileSync(getConfigFilename()))
}

export async function getPublicPackageConfig () {
  const publicConfig = await getPackageConfigJson('truffle.config')

  if (!publicConfig) {
    console.log('package config not found, make sure truffle.config.mjs or truffle.config.js exists')
    return
  }

  if (publicConfig.secretKey) {
    throw new Error('Secret key must go in truffle.secret.js')
  }
  return { ...publicConfig.default }
}

export async function getPackageConfig () {
  const publicConfig = await getPackageConfigJson('truffle.config')
  const secretConfig = await getPackageConfigJson('truffle.secret')

  if (!publicConfig || !secretConfig) {
    if (!publicConfig) {
      console.log(chalk.yellow.bold('Unable to find truffle.config.(js|mjs)'))
    }

    if (!secretConfig) {
      console.log(chalk.yellow.bold('Unable to find truffle.secret.(js|mjs)'))
    }
    return
  }

  if (publicConfig.secretKey) {
    throw new Error('Secret key must go in truffle.secret.js')
  }
  return { ...publicConfig.default, ...secretConfig.default }
}

async function getPackageConfigJson (prefix) {
  let config
  try {
    config = await import(path.join(process.cwd(), `./${prefix}.js`))
  } catch {
    try {
      config = await import(path.join(process.cwd(), `./${prefix}.mjs`))
    } catch {}
  }
  return config
}
