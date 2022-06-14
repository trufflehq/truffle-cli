import clone from './clone.js'
import { packageFork } from './util/package.js'

export default async function create (packageName) {
  const pkg = await packageFork({ orgSlug: 'truffle', packageSlug: 'default-site' })
  await clone({ packageVersionId: pkg.latestPackageVersionId })
}
