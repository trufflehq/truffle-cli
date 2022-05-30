import axios from 'axios'
import { getConfig } from './config.js'

export async function moduleUpsert ({ id, filename, type, code }) { //, propTypes }) {
  const { packageId, packageVersion } = await getConfig()
  const query = `
    mutation ModuleUpsert(
      $id: ID
      $packageId: ID
      $packageVersionSemver: String
      $filename: String
      $type: String
      $code: String
    ) {
      moduleUpsert(
        id: $id
        packageId: $packageId
        packageVersionSemver: $packageVersionSemver
        filename: $filename
        type: $type
        code: $code
      ) { id }
    }`

  const variables = {
    id, packageId, packageVersionSemver: packageVersion, filename, type, code
  }
  const response = await request({ query, variables })
  return response.data.data.componentUpsert
}

// TODO: moduleGetAll
export async function componentGetAllByPackageId (packageId) {
//   const query = `
//     query ComponentGetAll($packageId: ID) {
//       components(packageId: $packageId) {
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
//   const variables = { packageId }

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
