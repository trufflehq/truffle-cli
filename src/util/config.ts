import fs from 'fs'
import path from 'path'
import os from 'os'
import chalk from 'chalk'
import { container } from 'tsyringe'
import { CliConfig, OrgProfileConfig, PrivateConfig, PublicConfig } from '../types/config.js'
import { kApiUrl, kCliConfig, kProfile } from '../di/tokens.js'
import { defaultCliConfig } from '../assets/default-config.js'

function upgradeConfig (config: Record<string, OrgProfileConfig>): CliConfig {
  return {
    ...defaultCliConfig,
    orgProfiles: config
  }
}

export function getCliConfigFilename () {
  return path.resolve(os.homedir(), path.normalize('.truffle/config.json'))
}

export function getOrgProfileConfig (profile?: string): OrgProfileConfig {
  const containerProfile = container.resolve<string>(kProfile)
  profile = profile || containerProfile || 'default'

  const cliConfig = readCliConfig()

  const config = cliConfig.orgProfiles[profile]
  if (!config) {
    console.log(chalk.red(`No config found for profile "${profile}"`))
    process.exit(1)
  }

  return config
}

export function readCliConfig (): CliConfig {
  try {
    const parsed = JSON.parse(fs.readFileSync(getCliConfigFilename(), { encoding: 'utf-8' }))

    // If the config is in the old format, upgrade it
    if (!parsed.orgProfiles) {
      return upgradeConfig(parsed)
    }

    return parsed as CliConfig
  } catch (e) {
    // If the file doesn't exist, return an empty config
    if (e.syscall === 'open' && e.code === 'ENOENT') {
      return defaultCliConfig
    } else {
      console.log(chalk.red(`Error reading config: ${e.code}`))
      process.exit(1)
    }
  }
}

/**
 * Writes a new config to the ~/.truffle/config.json file
 * @param config
 */
export function writeCliConfig (config: CliConfig) {
  const filename = getCliConfigFilename()
  fs.mkdirSync(path.dirname(filename), { recursive: true })
  fs.writeFileSync(filename, JSON.stringify(config, null, 2))
}

export function getCliConfig (): CliConfig {
  return container.resolve<CliConfig>(kCliConfig)
}

export function registerCliConfig (config: CliConfig) {
  container.register(kCliConfig, { useValue: config })
}

export function getApiUrl () {
  return container.resolve<string>(kApiUrl)
}

export async function getPublicPackageConfig () {
  const publicConfig = await getPackageConfigJson<{ default: PublicConfig }>('truffle.config')

  if (!publicConfig) {
    console.log('package config not found, make sure truffle.config.mjs or truffle.config.js exists')
    return
  }

  if (publicConfig.default.secretKey) {
    throw new Error('Secret key must go in truffle.secret.js')
  }
  return { ...publicConfig.default }
}

export async function getPackageConfig () {
  const publicConfig = await getPackageConfigJson<{ default: PublicConfig }>('truffle.config')
  const secretConfig = await getPackageConfigJson<{ default: PrivateConfig }>('truffle.secret')

  if (!publicConfig || !secretConfig) {
    return
  }

  if (publicConfig.default.secretKey) {
    throw new Error('Secret key must go in truffle.secret.js')
  }
  return { ...publicConfig.default, ...secretConfig.default }
}

async function getPackageConfigJson<T> (prefix: string): Promise<T | undefined> {
  let config: T | undefined
  try {
    config = await import(new URL(`file://${path.join(process.cwd(), `/${prefix}.js`)}`).href)
  } catch {
    try {
      config = await import(new URL(`file://${path.join(process.cwd(), `/${prefix}.mjs`)}`).href)
    } catch {}
  }
  return config
}
