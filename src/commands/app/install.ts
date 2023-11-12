import { appInstallUpsert } from "../../util/app.js";
import { getCurrentOrgId } from "../../util/config.js";

export default async function appInstall(appPath: string) {

  const orgId = getCurrentOrgId();
  if (!orgId) {
    console.error(`Not using an org. Please run "truffle-cli org use" first.`);
    process.exit(1);
  }

  console.log(`Installing ${appPath} to org ${orgId}`);
  const upsertedAppInstall = await appInstallUpsert({
    appLocator: { path: appPath },
    orgId,
  });

  console.log(`App installed successfully! Version`, upsertedAppInstall.installedVersion);
}