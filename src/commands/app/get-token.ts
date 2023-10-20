import {
  fetchAppInstallAccessToken,
  fetchAppInstallConnection,
} from '../../util/app.js';
import { getCurrentOrgId } from '../../util/config.js';

export default async function appGetToken(appPath: string) {
  // get all app installs for this org
  const appInstalls = await fetchAppInstallConnection(getCurrentOrgId());

  // find the app install for this app
  const appInstall = appInstalls.find(
    (appInstall) => appInstall.app.path === appPath
  );

  if (!appInstall) {
    throw new Error(`App ${appPath} is not installed in this org`);
  }

  // get the access token for this app install
  const accessToken = await fetchAppInstallAccessToken(appInstall.id);
  console.log('New token:', accessToken);
}
