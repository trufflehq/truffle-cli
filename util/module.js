import { request } from './request.js'

export async function moduleUpsert ({ packageVersionId, id, filename, type, code }) { //, propTypes }) {
  if (code.indexOf('sk_') !== -1) {
    throw new Error('It looks like you\'re trying to deploy code with a secret key')
  }

  const query = `
    mutation ModuleUpsert(
      $id: ID
      $packageVersionId: ID
      $filename: String
      $type: String
      $code: String
    ) {
      moduleUpsert(
        id: $id
        packageVersionId: $packageVersionId
        filename: $filename
        type: $type
        code: $code
      ) { id, exports { type, componentRel { id } } }
    }`

  const variables = {
    id, packageVersionId, filename, type, code
  }
  const response = await request({ query, variables })
  return response.data.data.moduleUpsert
}
