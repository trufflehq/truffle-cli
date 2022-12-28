import { readCliConfig, writeCliConfig } from '../util/config.js'

// org-wide secretKey. or could use oauth when we build
export default async function auth ({ secretKey }: { secretKey: string }) {
  const config = readCliConfig()
  config.orgProfiles.default = {
    apiUrl: 'https://mycelium.staging.bio/graphql',
    secretKey
  }
  writeCliConfig(config)
}
