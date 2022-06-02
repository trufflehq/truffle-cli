import axios from 'axios'
import { getConfig } from './config.js'

export async function moduleUpsert ({ id, filename, type, code }) { //, propTypes }) {
  const { name, version } = await getConfig()

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

// TODO: moduleGetAll
export async function componentGetAllByPackageId (packageSlug) {
//   const query = `
//     query ComponentGetAll($packageSlug: ID) {
//       components(packageSlug: $packageSlug) {
//         nodes {
//           id
//           slug
//           jsx
//           sass
//           componentTemplateId
//           type
//           data
//           collection {
//             slug
//           }
//         }
//       }
//     }
//   `
//   const variables = { packageSlug }

//   const response = await request({ query, variables })
//   return response.data.data.components
}

async function request ({ query, variables }) {
  const { apiUrl, secretKey } = await getConfig()
  const response = await axios.post(apiUrl, { query, variables }, {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json'
    }
  })
  if (response?.data?.errors?.length) {
    throw new Error('Request error', JSON.stringify(response.data.errors))
  }
  return response
}
