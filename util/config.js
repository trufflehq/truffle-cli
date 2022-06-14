import fs from 'fs'
import path from 'path'
import os from 'os'

export function getConfigFilename (fiename) {
  return path.resolve(os.homedir(), '.truffle/config.json')
}

export function getGlobalConfig () {
  return JSON.parse(fs.readFileSync(getConfigFilename()))
}

export async function getPackageConfig () {
  const publicConfig = await getPackageConfigJson('truffle.config')
  const secretConfig = await getPackageConfigJson('truffle.secret')

  if (!publicConfig || !secretConfig) {
    console.log('No package config found, will fall back to global config')
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
