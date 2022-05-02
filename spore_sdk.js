import axios from 'axios'
import { getConfig } from './config.js'

export async function componentUpsert ({ id, slug, name, type, data, componentTemplateId, jsx, sass, propTypes }) {
  const query = `
    mutation ComponentUpsert(
      $id: ID
      $slug: String
      $name: String
      $type: String
      $data: JSON
      $componentTemplateId: ID
      # $childComponentConfigs: JSON
      $sass: String
      # $sassMixins: String
      $jsx: String
      $propTypes: JSON
    ) {
      componentUpsert(
        id: $id
        slug: $slug
        name: $name
        type: $type
        data: $data
        componentTemplateId: $componentTemplateId
        # childComponentConfigs: $childComponentConfigs
        sass: $sass
        # sassMixins: $sassMixins
        jsx: $jsx
        propTypes: $propTypes
      ) { id }
    }`

  const variables = { id, slug, name, type, data, componentTemplateId, jsx, sass, propTypes: JSON.stringify(propTypes) }
  const response = await request({ query, variables })
  return response.data.data.componentUpsert
}

export async function componentGetAllByPackageId (packageId) {
  const query = `
    query ComponentGetAll($packageId: ID) {
      components(packageId: $packageId) {
        nodes {
          id
          slug
          jsx
          sass
          componentTemplateId
          type
          data
          # propTypes need a way to pull entire json for this, not just [ComponentPropType]
          collection {
            slug
          }
        }
      }
    }
  `
  const variables = { packageId }

  const response = await request({ query, variables })
  return response.data.data.components
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
  // console.log('res', JSON.stringify(response.data, null, 2))
  if (response?.data?.errors?.length) {
    throw new Error('Request error', JSON.stringify(response.data.errors))
  }
  return response
}
