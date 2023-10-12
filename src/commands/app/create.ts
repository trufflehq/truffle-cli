import { fetchApp, readAppConfig, upsertApp } from '../../util/app.js';
import { getCurrentOrgId } from '../../util/config.js';
import { writeFile } from 'fs/promises';

export default async function createApp(appSlug?: string) {
  // check if app config already exists
  try {
    const existingConfig = await readAppConfig();
    if (existingConfig) {
      console.error('App config already exists in this directory');
      process.exit(1);
    }
  } catch {} // ignore error

  const orgId = getCurrentOrgId();

  if (!orgId) {
    console.error(
      'Select an org with `truffle org use <org-slug|org-id>` before creating an app.'
    );
    process.exit(1);
  }

  console.log(`Creating app "${appSlug}" in org ${orgId}...`);

  const existingApp = await fetchApp({ slug: appSlug, orgId });

  if (existingApp) {
    console.error(`App "${appSlug}" already exists in org ${orgId}`);
    process.exit(1);
  }

  const newApp = await upsertApp({
    slug: appSlug,
    orgId,
  });

  if (!newApp) {
    console.error(`Failed to create app "${appSlug}" in org ${orgId}`);
    process.exit(1);
  }

  console.log(`Created app "${appSlug}" with id ${newApp.id} in org ${orgId}`);

  // write the raw config to a file
  await writeFile('truffle.config.js', newApp.configRaw);
  console.log('Wrote truffle.config.js');
}
