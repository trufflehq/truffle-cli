import { fetchAppConnection } from '../../util/app';
import { getCurrentOrgId } from '../../util/cli-config';

export default async function appList() {
  const orgId = getCurrentOrgId();
  const apps = await fetchAppConnection({ orgId });

  console.log(`Found ${apps.length} apps in org ${orgId}:\n`);
  apps.forEach((app) => {
    console.log(`- ${app.name} ${app.path}`);
  });
}
