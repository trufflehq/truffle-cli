import { writeFile } from 'fs/promises';
import { fetchApp } from '../../util/app';
import { getCurrentOrgId } from '../../util/cli-config';
import {
  DEFAULT_APP_CONFIG_FILE_NAME,
  isInAppDir,
} from '../../util/app-config';

export default async function appClone(appSlug: string) {
  // check if app config already exists
  if (await isInAppDir()) {
    console.error(
      `Cannot create app here; ${DEFAULT_APP_CONFIG_FILE_NAME} already exists`,
    );
    process.exit(1);
  }

  console.log(
    `Cloning app "${appSlug}" into ${DEFAULT_APP_CONFIG_FILE_NAME}...`,
  );

  // fetch app config by slug or path
  const isPath = appSlug[0] === '@';
  const app = isPath
    ? await fetchApp({ path: appSlug }, { throwError: true })
    : await fetchApp(
        { orgIdAndSlug: { slug: appSlug, orgId: getCurrentOrgId() } },
        { throwError: true },
      );

  // write the raw config to a file
  await writeFile(DEFAULT_APP_CONFIG_FILE_NAME, app.configRaw);
  console.log(`Wrote ${DEFAULT_APP_CONFIG_FILE_NAME}`);
}
