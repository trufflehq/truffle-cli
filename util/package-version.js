import { request } from './request.js'
import { getPackageParts } from './package.js'
import { getPackageConfig } from './config.js'

export async function packageVersionGet ({ id, packagePath } = {}) {
  let packageSlug, packageVersionSemver
  if (packagePath) {
    ({ packageSlug, packageVersionSemver } = getPackageParts(packagePath))
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
        requestedPermissions
        installActionRel
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

export async function packageVersionCreate ({ packageId, semver, installActionRel, requestedPermissions }) {
  const query = `
    mutation PackageVersionCreate($packageId: ID, $semver: String, $installActionRel: JSON, $requestedPermissions: JSON) {
      packageVersionCreate(packageId: $packageId, semver: $semver, installActionRel: $installActionRel, requestedPermissions: $requestedPermissions) {
        id
      }
    }
  `
  const variables = { packageId, semver, installActionRel, requestedPermissions }

  const response = await request({ query, variables })
  return response.data.data.packageVersionCreate
}
