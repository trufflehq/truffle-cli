import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import { container } from 'tsyringe';
import { CliConfig } from '../types/config.js';
import { kApiUrl, kCliConfig, kCurrentOrg } from '../di/tokens.js';
import { defaultCliConfig } from '../assets/default-config.js';

function upgradeConfig(config: CliConfig): CliConfig {
  // if the config is using mycelium, switch it over to mothertree

  // change config.apiUrl from mycelium to mothertree
  config.apiUrl = config.apiUrl.replace('mycelium', 'mothertree');

  // go through all of the keys in config.userAccessTokens and replace mycelium with mothertree
  config.userAccessTokens = Object.entries(
    config?.userAccessTokens ?? {},
  ).reduce((newAccessTokens, [key, value]) => {
    const newKey = key.replace('mycelium', 'mothertree');
    newAccessTokens[newKey] = value;
    return newAccessTokens;
  }, {});

  // go through all of the keys in config.currentOrgs and replace mycelium with mothertree
  config.currentOrgs = Object.entries(config?.currentOrgs ?? {}).reduce(
    (newCurrentOrgs, [key, value]) => {
      const newKey = key.replace('mycelium', 'mothertree');
      newCurrentOrgs[newKey] = value;
      return newCurrentOrgs;
    },
    {},
  );

  // write upgraded config to fs
  writeCliConfig(config);

  return config;
}

export function getCliConfigFilename() {
  return path.resolve(os.homedir(), path.normalize('.truffle/config.json'));
}

export function readCliConfig(): CliConfig {
  try {
    const parsed = JSON.parse(
      fs.readFileSync(getCliConfigFilename(), { encoding: 'utf-8' }),
    );

    // If the config is in any old formats, upgrade it
    const upgradedConfig = upgradeConfig(parsed);
    return upgradedConfig as CliConfig;
  } catch (e) {
    // If the file doesn't exist, return an empty config
    if (e.syscall === 'open' && e.code === 'ENOENT') {
      return defaultCliConfig;
    } else {
      console.log(chalk.red(`Error reading config: ${e.code}`));
      process.exit(1);
    }
  }
}

/**
 * Writes a new config to the ~/.truffle/config.json file
 * @param config
 */
export function writeCliConfig(config: CliConfig) {
  const filename = getCliConfigFilename();
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, JSON.stringify(config, null, 2));
}

export function getCliConfig(): CliConfig {
  return container.resolve<CliConfig>(kCliConfig);
}

export function registerCliConfig(config: CliConfig) {
  container.register(kCliConfig, { useValue: config });
}

export function getApiUrl() {
  return container.resolve<string>(kApiUrl);
}

export function getCurrentOrgId() {
  return container.resolve<string>(kCurrentOrg);
}
