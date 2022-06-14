import { request } from './request.js'
import { getPackageConfig } from './config.js'

export async function moduleUpsert ({ id, filename, type, code }) { //, propTypes }) {
  const { name, version } = await getPackageConfig()

  const packageNameParts = name.split('/')
  const packageSlug = packageNameParts[packageNameParts.length - 1]

  if (code.indexOf('sk_') !== -1) {
    throw new Error('It looks like you\'re trying to deploy code with a secret key')
  }

  const query = `
    mutation ModuleUpsert(
      $id: ID
      $packageSlug: String
      $packageVersionSemver: String
      $filename: String
      $type: String
      $code: String
    ) {
      moduleUpsert(
        id: $id
        packageSlug: $packageSlug
        packageVersionSemver: $packageVersionSemver
        filename: $filename
        type: $type
        code: $code
      ) { id }
    }`

  const variables = {
    id, packageSlug, packageVersionSemver: version, filename, type, code
  }
  const response = await request({ query, variables })
  return response.data.data.componentUpsert
}
