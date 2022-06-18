import { request } from './request.js'

export async function routeUpsert ({ packageVersionId, pathWithVariables, routerId, componentId }) {
  const query = `
    mutation RouteUpsert(
      $packageVersionId: ID
      $pathWithVariables: String
      $routerId: ID
      $componentId: ID
    ) {
      routeUpsert(
        packageVersionId: $packageVersionId
        pathWithVariables: $pathWithVariables
        routerId: $routerId
        componentId: $componentId
      ) {
        id
      }
    }  
  `
  const variables = {
    pathWithVariables, packageVersionId, routerId, componentId
  }

  const response = await request({ query, variables })
  return response.data.data.routeUpsert
}
