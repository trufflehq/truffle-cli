import { getOrg } from "../../util/org.js"
import { getApiUrl, getCliConfig, writeCliConfig } from "../../util/config.js"

export default async function (slugOrId: string) {
  // check if they passed in a slug or uuid
  const isUuid = slugOrId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)

  // if they passed in a slug, get the org
  let orgId: string
  if (isUuid) {
    orgId = slugOrId
  } else {
    const org = await getOrg({ slug: slugOrId })
    orgId = org.id
  }

  // write the org id to the cli config
  const cliConfig = getCliConfig()
  const apiUrl = getApiUrl()
  cliConfig.currentOrgs[apiUrl] = orgId
  writeCliConfig(cliConfig)

  console.log(`Now using org ${orgId} for API "${apiUrl}"`)
}