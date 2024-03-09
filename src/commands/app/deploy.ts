import { appUpsert } from '../../util/app';
import {
  DEFAULT_APP_CONFIG_FILE_NAME,
  convertAppConfigToMothertreeConfig,
  readAppConfig,
  readRawAppConfig,
  validateAppConfig,
} from '../../util/app-config';

export default async function appDeploy() {
  let configModule: { default: any } | undefined;
  try {
    configModule = await readAppConfig();
  } catch (e) {
    console.error(`Error reading ${DEFAULT_APP_CONFIG_FILE_NAME}:`, e);
    process.exit(1);
  }

  const config = configModule?.default;

  if (!config) {
    console.error(`No config found in ${DEFAULT_APP_CONFIG_FILE_NAME}`);
    process.exit(1);
  }

  if (!config.path) {
    console.error(`No path found in ${DEFAULT_APP_CONFIG_FILE_NAME}`);
    process.exit(1);
  }

  // validate the app config
  validateAppConfig(config);

  const mtConfig = convertAppConfigToMothertreeConfig(config);

  const upsertedApp = await appUpsert({
    path: config.path,
    configJson: mtConfig,
    configRaw: await readRawAppConfig(),
  });

  console.log(`Deployed ${config.path} version ${upsertedApp?.currentVersion}`);
}
