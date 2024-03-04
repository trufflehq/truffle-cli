import { readFile } from 'fs/promises';
import path from 'path';

export const DEFAULT_APP_CONFIG_FILE_NAME = 'truffle.config.mjs';

export function getAppConfigPath() {
  return path.join(process.cwd(), `/${DEFAULT_APP_CONFIG_FILE_NAME}`);
}

export async function readRawAppConfig() {
  return await readFile(getAppConfigPath(), 'utf8');
}

export async function readAppConfig() {
  return await import(new URL(`file://${getAppConfigPath()}`).href);
}

export async function isInAppDir() {
  // check if app config already exists
  try {
    await readAppConfig();
    return true;
  } catch {
    return false;
  }
}
