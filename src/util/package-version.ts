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
      resourcePath
      actionRel {
          action {
              resourcePath
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
      resourcePath
  }
}`

/**
 * Options to pass to `packageVersionCreate`
 * @typedef {Object} PackageVersionGetOptions
 * @property {string} id - The id of the package version to get
 * @property {string} packagePath - The path to the package
 * @property {boolean} includeModules - Whether to include the modules in the response
 * @property {boolean} includePackage - Whether to include the package in the response
 * @property {boolean} includeEventSubscriptions - Whether to include the event subscriptions in the response
 * @property {boolean} includeEventTopics - Whether to include the event topics in the response
 */
export interface PackageVersionGetOptions {
  id?: string
  packagePath?: string
  includeModules?: boolean
  includePackage?: boolean
  includeEventSubscriptions?: boolean
  includeEventTopics?: boolean
}

/**
 *
 * @param {PackageVersionGetOptions} options
 * @returns {Promise<Object>} The package version
 */
export async function packageVersionGet (options?: PackageVersionGetOptions) {
  const {
    id, packagePath, includeModules = true, includePackage = true,
    includeEventSubscriptions = false, includeEventTopics = false
  } = options || {}
  let packageSlug: string | undefined
  let packageVersionSemver: string | undefined

  if (packagePath) {
    const parsed = getPackageParts(packagePath)
    packageSlug = parsed?.packageSlug
    packageVersionSemver = parsed?.packageVersionSemver
  } else if (!id) {
    const config = await getPackageConfig()
    const parsed = getPackageParts(config!.name)
    packageSlug = parsed?.packageSlug
    packageVersionSemver = config?.version
  }

  const query = `
  query PackageVersionGet($input: PackageVersionInput) {
    packageVersion(input: $input) {
      ${BASE_PACKAGE_VERSION_FIELDS}
      ${includeModules ? BASE_MODULE_CONNECTION_FIELDS : ''}
      ${includePackage ? BASE_PACKAGE_FIELDS : ''}
      ${includeEventSubscriptions ? BASE_EVENT_SUBSCRIPTION_FIELDS : ''}
      ${includeEventTopics ? BASE_EVENT_TOPIC_FIELDS : ''}
    }
  }
  `

  const variables = { input: { id, packageSlug, semver: packageVersionSemver } }

  const response = await request({ query, variables })
  return response.data.packageVersion
}

export async function packageVersionPathGetLatest () {
  const packageVersion = await packageVersionGet()

  const orgSlug = packageVersion.package?.org?.slug
  const packageSlug = packageVersion.package?.slug

  return `@${orgSlug}/${packageSlug}@latest`
}

interface PackageVersionCreateOptions {
  packageId: string
  semver: string
  installActionRel: Record<string, unknown>
  requestedPermissions: Record<string, unknown>[]
}

export async function packageVersionCreate ({ packageId, semver, installActionRel, requestedPermissions }: PackageVersionCreateOptions) {
  const query = `
    mutation PackageVersionCreate($input: PackageVersionCreateInput!) {
      packageVersionCreate(input: $input) {
        packageVersion { id }
      }
    }
  `
  const variables = { input: { packageId, semver, installActionRel, requestedPermissions } }

  const response = await request({ query, variables })
  return response.data.packageVersionCreate.packageVersion as { id: string }
}

interface PackageVersionUpdateOptions {
  packageId: string
  semver: string
  installActionRel: Record<string, unknown>
  requestedPermissions: Record<string, unknown>[]
}

export async function packageVersionUpdate ({ packageId, semver, status, installActionRel, requestedPermissions }: PackageVersionUpdateOptions) {
  const query = `
    mutation PackageVersionUpdate($input: PackageVersionUpdateInput!) {
      packageVersionUpdate(input: $input) { packageVersion { id } }
    }
  `
  const variables = { input: { packageId, semver, status, installActionRel, requestedPermissions } }

  const response = await request({ query, variables })

  return response.data.packageVersionUpdate.packageVersion as { id: string }
}
