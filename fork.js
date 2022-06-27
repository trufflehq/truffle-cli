import { packageFork } from './util/package.js'
import clone from './clone.js'

export default async function fork ({ packagePath, toPackageSlug } = {}) {
  const pkg = await packageFork({ packagePath, toPackageSlug })
  const packageVersionId = pkg.latestPackageVersionId

  await clone({ packageVersionId, toPackageSlug, shouldCreateConfigFile: true })
}
