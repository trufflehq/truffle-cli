import { packageFork } from '../util/package.js'
import { apiKeyCreate } from '../util/api-key.js'
import clone from '../util/clone.js'

export default async function fork ({
    packagePath,
    toPackageSlug,
    shouldCreateSporocarpFiles
  }:
  {
    packagePath: string,
    toPackageSlug: string,
    shouldCreateSporocarpFiles?: boolean
  }) {
  const pkg = await packageFork({ packagePath, toPackageSlug })
  const packageVersionId = pkg.latestPackageVersionId

  const apiKeyPayload = await apiKeyCreate({ type: 'secret', sourceType: 'package', sourceId: pkg.id })

  await clone({
    packageVersionId,
    toPackageSlug,
    shouldCreateConfigFile: true,
    shouldCreateSporocarpFiles,
    secretKey: apiKeyPayload.apiKey.key
  })
}
