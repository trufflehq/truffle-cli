import { request } from './request.js'
import { packageVersionGet } from './package-version.js'
import { getPackageConfig } from './config.js';

interface PackageInstallCreateOptions {
  installedPackageVersionPath: string
  isForceInstall?: boolean;
}

export async function packageInstallCreate ({ installedPackageVersionPath, isForceInstall = false }: PackageInstallCreateOptions) {
  const packageVersion = await packageVersionGet()

  const query = `
    mutation PackageInstallCreate(
      $input: PackageInstallCreateInput!
    ) {
      packageInstallCreate(input: $input) { 
        packageInstall { 
          id
          installStatus
        } 
        userErrors
      }
    }`
  const variables = {
    input: {
      packageVersionId: packageVersion.id,
      installedPackageVersionPath,
      isForceInstall
    }
  }

  try {
    const response = await request({ query, variables })
    return { packageInstall: response.data.packageInstallCreate.packageInstall, userErrors: response.data.packageInstallCreate.userErrors }
  } catch (err) {
    return err.message
  }
}

interface PackageInstall {
  id: string;
  installStatus: string;
}

export async function packageInstallGet (options?: { packagePath: string }) {
  let { packagePath } = options || {}

  if (!packagePath) {
    packagePath = (await getPackageConfig())?.name ?? '';

    if (!packagePath) {
      console.log("Package path not specified in config.")
      return
    }
  }

  const query = `
    query PackageInstallGet($packagePath: String!) {
      packageInstall(input: { packagePath: $packagePath }) {
        id
        installStatus
      }
    }
  `;

  const res = await request({
    query,
    variables: { packagePath },
    isOrgRequired: false,
    shouldUseGlobal: true
  });
  return res.data?.packageInstall as PackageInstall;  
}

export async function packageInstallTokenGet(packageInstallId: string) {
  const query = `
    query PackageInstallTokenGet($packageInstallId: ID!) {
      packageInstallUserAccessToken(input: { packageInstallId: $packageInstallId })
    }
  `;

  const res = await request({
    query,
    variables: { packageInstallId },
    isOrgRequired: false,
    shouldUseGlobal: true
  });
  return res.data?.packageInstallToken as string;
}
