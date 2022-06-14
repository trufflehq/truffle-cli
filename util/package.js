import { request } from './request.js'

export async function packageFork ({ orgSlug, packageSlug }) {
  const query = `
    mutation PackageFork($orgSlug: String, $packageSlug: String) {
      packageFork(orgSlug: $orgSlug, packageSlug: $packageSlug) {
        id, latestPackageVersionId
      }
    }
  `
  const variables = { orgSlug, packageSlug }

  const response = await request({ query, variables })
  return response.data.data.packageFork
}
