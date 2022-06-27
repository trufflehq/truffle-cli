import { request } from './request.js'
import { packageVersionGet } from './package-version.js'

export async function packageInstallCreate ({ installedPackageVersionPath }) {
  const packageVersion = await packageVersionGet()

  const query = `
    mutation PackageInstallCreate(
      $input: PackageInstallCreateInput!
    ) {
      packageInstallCreate(input: $input) { packageInstall { id } }
    }`
  const variables = {
    input: {
      packageVersionId: packageVersion.id,
      installedPackageVersionPath
    }
  }

  const response = await request({ query, variables })
  return response.data.data.packageInstallCreate
}
