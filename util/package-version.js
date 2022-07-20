import { request } from './request.js'
import { getPackageParts } from './package.js'
import { getPackageConfig } from './config.js'

const BASE_PACKAGE_VERSION_FIELDS = `id
semver
requestedPermissions
installActionRel
`

const BASE_MODULE_CONNECTION_FIELDS = `
moduleConnection {
  nodes {
    filename
    code
  }
}
`

const BASE_PACKAGE_FIELDS = `package { id, slug, org { slug } name }`

const BASE_EVENT_SUBSCRIPTION_FIELDS = `eventSubscriptionConnection {
  nodes {
      id
      status
      eventTopicPath
      actionRel {
          actionPath
          action {
              type
          }
          runtimeData
      }
  }
}`

const BASE_EVENT_TOPIC_FIELDS = `eventTopicConnection {
  nodes {
      id
      slug
      eventTopicPath
  }
}`

export async function packageVersionGet (options) {
  const {
    id, packagePath, includeModules = true, includePackage = true,
    includeEventSubscriptions = false, includeEventTopics = false
  } = options || {}
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
      ${BASE_PACKAGE_VERSION_FIELDS}
      ${includeModules ? BASE_MODULE_CONNECTION_FIELDS : ''}
      ${includePackage ? BASE_PACKAGE_FIELDS : ''}
      ${includeEventSubscriptions ? BASE_EVENT_SUBSCRIPTION_FIELDS : ''}
      ${includeEventTopics ? BASE_EVENT_TOPIC_FIELDS : ''}
    }
  }
  `
  const variables = { id, packageSlug, semver: packageVersionSemver }

  const response = await request({ query, variables })
  return response.data.data.packageVersion
}

export async function packageVersionPathGetLatest() {
  const packageVersion = await packageVersionGet()

  const orgSlug = packageVersion.package?.org?.slug
  const packageSlug = packageVersion.package?.slug

  return `@${orgSlug}/${packageSlug}@latest`
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


export async function packageVersionUpdate ({ packageId, semver, installActionRel, requestedPermissions }) {
  const query = `
    mutation PackageVersionUpdate($packageId: ID, $semver: String, $installActionRel: JSON, $requestedPermissions: JSON) {
      packageVersionUpdate(packageId: $packageId, semver: $semver, installActionRel: $installActionRel, requestedPermissions: $requestedPermissions) {
        id
      }
    }
  `
  const variables = { packageId, semver, installActionRel, requestedPermissions }

  const response = await request({ query, variables })
  return response.data.data.packageVersionCreate
}
