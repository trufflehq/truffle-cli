import { getOrg } from '../../util/org';
import { getApiUrl, getCliConfig, writeCliConfig } from '../../util/cli-config';

export default async function (slugOrId: string) {
  // check if they passed in a slug or uuid
  const isUuid = slugOrId.match(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  );

  let orgId: string;
  // if they passed in a uuid, use that
  if (isUuid) {
    orgId = slugOrId;

    // if they passed in a slug, get the org
  } else {
    const org = await getOrg({ slug: slugOrId });
    if (!org) {
      console.error(`No org found with slug "${slugOrId}"`);
      process.exit(1);
    }
    orgId = org.id;
  }

  // write the org id to the cli config
  const cliConfig = getCliConfig();
  const apiUrl = getApiUrl();
  cliConfig.currentOrgs[apiUrl] = orgId;
  writeCliConfig(cliConfig);

  console.log(`Now using org ${orgId} for API "${apiUrl}"`);
}
