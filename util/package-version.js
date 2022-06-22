import { request } from './request.js'
import { getPackageParts } from './package.js'
import { getPackageConfig } from './config.js'

export async function packageVersionGet ({ id, combinedPackageSlug } = {}) {
  let packageSlug, packageVersionSemver
  if (combinedPackageSlug) {
    ({ packageSlug, packageVersionSemver } = getPackageParts(combinedPackageSlug))
  } else if (!id) {
    const { name, version } = await getPackageConfig()
    ;({ packageSlug } = getPackageParts(name))
    packageVersionSemver = version
  }

  const query = `
    query PackageVersionGet($id: ID, $packageSlug: String, $semver: String) {
      packageVersion(id: $id, packageSlug: $packageSlug, semver: $semver) {
        id
        semver
        package { slug, org { slug } }
        moduleConnection {
          nodes {
            filename
            code
          }
        }
      }
    }
  `
  const variables = { id, packageSlug, semver: packageVersionSemver }

  const response = await request({ query, variables })
  return response.data.data.packageVersion
}

export async function packageVersionIncrement ({ fromId }) {
  const { version } = await getPackageConfig()

  const query = `
    mutation PackageVersionIncrement($fromId: ID, $toSemver: String) {
      packageVersionIncrement(fromId: $fromId, toSemver: $toSemver) {
        id
      }
    }
  `
  const variables = { fromId, toSemver: version }

  const response = await request({ query, variables })
  return response.data.data.packageVersionIncrement
}
