import { defaultAppConfig } from 'src/constants/default-app-config';
import { fetchApp, appUpsert } from '../../util/app';
import { getCurrentOrgId } from '../../util/cli-config';
import { writeFile } from 'fs/promises';
import { getOrg } from 'src/util/org';
import {
  DEFAULT_APP_CONFIG_FILE_NAME,
  isInAppDir,
} from '../../util/app-config';

export default async function appCreate(appSlug: string) {
  // check if app config already exists
  if (await isInAppDir()) {
    console.error(
      `Cannot create app here; ${DEFAULT_APP_CONFIG_FILE_NAME} already exists`,
    );
    process.exit(1);
  }

  const orgId = getCurrentOrgId();

  if (!orgId) {
    console.error(
      'Select an org with `truffle org use <org-slug|org-id>` before creating an app.',
    );
    process.exit(1);
  }

  console.log(`Creating app "${appSlug}" in org ${orgId}...`);

  const existingApp = await fetchApp({
    orgIdAndSlug: { slug: appSlug, orgId },
  });

  if (existingApp) {
    console.error(`App "${appSlug}" already exists in org ${orgId}`);
    process.exit(1);
  }

  const org = await getOrg({ id: orgId });

  if (!org) {
    console.error(`Failed to fetch org ${orgId}`);
    process.exit(1);
  }

  const defaultConfig = defaultAppConfig({
    orgSlug: org.slug,
    appSlug,
    appName: appSlug,
  });

  const newApp = await appUpsert({
    slug: appSlug,
    orgId,
    configRaw: defaultConfig.raw,
    configJson: defaultConfig.json,
  });

  if (!newApp) {
    console.error(`Failed to create app "${appSlug}" in org ${orgId}`);
    process.exit(1);
  }

  console.log(`Created app "${appSlug}" with id ${newApp.id} in org ${orgId}`);

  // write the raw config to a file
  await writeFile(DEFAULT_APP_CONFIG_FILE_NAME, newApp.configRaw);
  console.log(`Wrote ${DEFAULT_APP_CONFIG_FILE_NAME}`);
}
