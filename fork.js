import { packageFork } from './util/package.js'
import clone from './clone.js'

export default async function fork ({ combinedPackageSlug, toPackageSlug } = {}) {
  const pkg = await packageFork({ combinedPackageSlug, toPackageSlug })
  const packageVersionId = pkg.latestPackageVersionId

  await clone({ packageVersionId, toPackageSlug, shouldCreateConfigFile: true })
}
