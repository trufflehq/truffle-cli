import { getPublicPackageConfig } from "./config.js"
import { request } from "./request.js"

const MODULE_REGEX = /@(.*?)\/([^@]+)(?:@([0-9.]+))?([^?#]*)$/i

interface PackageForkOptions {
  packagePath: string;
  toPackageSlug: string;
}

export async function packageFork ({ packagePath, toPackageSlug }: PackageForkOptions) {
  const { orgSlug, packageSlug, packageVersionSemver } =
    (getPackageParts(packagePath))!

  const query = `
    mutation PackageFork(
      $fromOrgSlug: String
      $fromPackageSlug: String
      $fromPackageVersionSemver: String
      $toPackageSlug: String
    ) {
      packageFork(
        fromOrgSlug: $fromOrgSlug
        fromPackageSlug: $fromPackageSlug
        fromPackageVersionSemver: $fromPackageVersionSemver
        toPackageSlug: $toPackageSlug
      ) {
        id
        latestPackageVersionId
      }
    }`
  const variables = {
    fromOrgSlug: orgSlug,
    fromPackageSlug: packageSlug,
    fromPackageVersionSemver: packageVersionSemver,
    toPackageSlug
  }

  const response = await request({ query, variables })
  return response.data.packageFork
}

interface PackageInstallOptions {
  installPackagePath: string;
  toPackageVersionId: string;
}

export async function packageInstall ({
  installPackagePath,
  toPackageVersionId
}: PackageInstallOptions) {
  const query = `
    mutation PackageInstall(
      $installPackagePack: String
      $toPackageVersionId: String
    ) {
      packageInstall(
        installPackagePack: $installPackagePack
        toPackageVersionId: $toPackageVersionId
      ) { id }
    }`
  const variables = {
    installPackagePath,
    toPackageVersionId
  }

  const response = await request({ query, variables })
  return response.data.packageInstall
}

interface PackageGetOptions {
  shouldUseGlobal?: boolean;
}

export async function packageGet ({ shouldUseGlobal = false }: PackageGetOptions = {}) {
  const { name } = (await getPublicPackageConfig())!
  const { packageSlug } = (getPackageParts(name))!

  const query = `
    query PackageGet($slug: String) {
      package(slug: $slug) {
        id
        latestPackageVersionId
      }
    }
  `
  const variables = { slug: packageSlug }

  const response = await request({ query, variables, shouldUseGlobal })
  return response.data.package as { id: string, latestPackageVersionId: string }
}

export async function packageList () {
  const query = `
  query PackageConnection ($first: Int, $after: String, $last: Int, $before: String) {
    packageConnection(first: $first, after: $after, last: $last, before: $before) {
        totalCount
        pageInfo {
            endCursor
            hasNextPage
        }
        nodes {
            id
            slug
            packageVersionConnection (filter: DESC) {
                nodes {
                  semver
                }
            }
        }
    }
}
  `

  const response = await request({
    query,
    variables: {},
    shouldUseGlobal: true
  })

  return response.data.packageConnection as {
    totalCount: number;
    pageInfo: { endCursor: string; hasNextPage: boolean };
    nodes: {
      id: string;
      slug: string;
      packageVersionConnection: { nodes: { semver: string }[] };
    }[];
  }
}

export function getPackageParts (urlOrStr: string) {
  const [all, orgSlug, packageSlug, packageVersionSemver, filename] =
    urlOrStr?.match(MODULE_REGEX) || []
  if (!all) {
    console.log("failed to parse", urlOrStr)
  }
  return all ? { orgSlug, packageSlug, packageVersionSemver, filename } : null
}
