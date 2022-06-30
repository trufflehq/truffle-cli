import fs from 'fs'

import { packageGet } from './util/package.js'
import { apiKeyCreate } from './util/api-key.js'

export default async function regeneratePackageApiKey () {
  const pkg = await packageGet()

  if (!pkg?.id) {
    console.log('\nPackage not found. If the package doesn\'t exist yet run `truffle-cli create <package-slug>`.')
    return
  }
  const apiKeyPayload = await apiKeyCreate({ type: 'secret', sourceType: 'package', sourceId: pkg.id })

  console.log('Here is your new package API key: ', apiKeyPayload.apiKey.key)
  const secretKey = apiKeyPayload.apiKey.key
  const secretFilename = './truffle.secret.mjs'
  fs.writeFileSync(secretFilename, `export default {
secretKey: '${secretKey}'
}`)
  console.log('Updated secret key inside of truffle.secret.mjs')
}
