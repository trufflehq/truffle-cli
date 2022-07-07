import { request } from './request.js'
import { packageVersionGet } from './package-version.js'

export async function packageInstallCreate ({ installedPackageVersionPath, isForceInstall = false }) {
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
    return { packageInstall: response.data.data.packageInstallCreate.packageInstall, userErrors: response.data.data.packageInstallCreate.userErrors }
  } catch (err) {
    return err.message
  }
}
