import { request } from './request.js'
import { packageVersionGet } from './package-version.js'

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
