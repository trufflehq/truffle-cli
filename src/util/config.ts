import fs from 'fs'
import path from 'path'
import os from 'os'

export interface PrivateConfig {
  secretKey: string;
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
    name: string;
    description: string;
    entrypoint: string;
  }[]
}

export function getConfigFilename () {
  return path.resolve(os.homedir(), path.normalize('.truffle/config.json'))
}

export function getGlobalConfig () {
  return JSON.parse(fs.readFileSync(getConfigFilename()).toString('utf-8'))
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
