import fs from 'fs'
import path from 'path'
import os from 'os'
import chalk from 'chalk';

export const kProfile = Symbol.for('profile')

export interface PrivateConfig {
  secretKey: string;
  secrets: Record<string, Record<string, string>>;
}

export interface StepActionRelRuntimeData {
  query: string;
  variables: Record<string, unknown>;
}

export interface StepActionRel {
  actionPath: string;
  runtimeData: StepActionRelRuntimeData;
}

export interface RuntimeData {
  mode: string;
  stepActionRels: StepActionRel[];
}

export interface InstallActionRel {
  actionPath: string;
  runtimeData: RuntimeData;
}

export interface PublicConfig {
  name: string;
  version: string;
  apiUrl: string;
  secretKey: string;
  requestedPermissions: {
    action: string;
    value: string;
    filters: Record<string, { isAll: boolean; rank: number}>
  }[];
  installActionRel: InstallActionRel;
  functions: {
    slug: string;
    description: string;
    entrypoint: string;
  }[]
}

interface GlobalConfigData {
  apiUrl: string
  secretKey: string
}

type GlobalConfig = Record<string, GlobalConfigData> | GlobalConfigData // compat

export function getConfigFilename () {
  return path.resolve(os.homedir(), path.normalize('.truffle/config.json'))
}

const warning = `[config] DeprecationWarning: Housing one truffle-cli config in ~/.truffle/config.json has been deprecated.
Scope your profiles in an object: "{ "default": { "apiURL": "...", "secretKey": "..." } }".
See: https://github.com/trufflehq/truffle-cli/pull/10
`

function configIsOldFormat (config: GlobalConfig): config is GlobalConfigData {
  return 'apiUrl' in config
}
let warned = false

export function getGlobalConfig (profile = 'default'): GlobalConfigData {
  const parsed: GlobalConfig = JSON.parse(fs.readFileSync(getConfigFilename(), { encoding: 'utf-8' }))

  // throw a deprecation warning if the config is in the old format
  if (configIsOldFormat(parsed)) {
    if (!warned) {
      warned = true
      console.warn(warning)
    }
    return parsed as GlobalConfigData
  }

  const config = parsed[profile]
  if (!config) {
    console.log(chalk.red(`No config found for profile "${profile}"`))
    process.exit(1)
  }

  return config
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
