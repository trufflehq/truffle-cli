import fs from 'fs'
import path from 'path'

import { getConfigFilename } from '../util/config.js'

// org-wide secretKey. or could use oauth when we build
export default async function auth ({ secretKey }: { secretKey: string }) {
  const configFilename = getConfigFilename()
  fs.mkdirSync(path.dirname(configFilename), { recursive: true })
  fs.writeFileSync(configFilename, JSON.stringify({
    default: {
      apiUrl: 'https://mycelium.staging.bio/graphql', // FIXME
      secretKey
    }
  }))
}
