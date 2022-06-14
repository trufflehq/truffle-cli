import { request } from './request.js'
import { getPackageConfig } from './config.js'

export async function packageVersionGet ({ id }) {
  const { name, version } = await getPackageConfig() || {}

  const packageNameParts = name?.split('/')
  const packageSlug = packageNameParts?.[packageNameParts.length - 1]

  const query = `
    query PackageVersionGet($id: ID, $packageSlug: String, $semver: String) {
      packageVersion(id: $id, packageSlug: $packageSlug, semver: $semver) {
        package { slug }
        moduleConnection {
          nodes {
            filename
            code
          }
        }
      }
    }
  `
  const variables = { id, packageSlug, semver: version }

  const response = await request({ query, variables })
  return response.data.data.packageVersion
}
