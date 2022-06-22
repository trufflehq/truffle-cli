import { request } from './request.js'

export async function routeUpsert ({ packageVersionId, pathWithVariables, parentId, componentId, data }) {
  const query = `
    mutation RouteUpsert(
      $packageVersionId: ID
      $pathWithVariables: String
      $parentId: ID
      $componentId: ID
      $data: JSON
    ) {
      routeUpsert(
        packageVersionId: $packageVersionId
        pathWithVariables: $pathWithVariables
        parentId: $parentId
        componentId: $componentId
        data: $data
      ) {
        id
      }
    }  
  `
  const variables = {
    pathWithVariables, packageVersionId, parentId, componentId, data
  }

  const response = await request({ query, variables })
  return response.data.data.routeUpsert
}
