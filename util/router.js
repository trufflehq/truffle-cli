import { request } from './request.js'

export async function routerUpsert ({ packageVersionId, parentId, base, componentId }) {
  const query = `
    mutation RouteUpsert(
      $packageVersionId: ID
      $parentId: ID
      $base: String
      $componentId: ID
    ) {
      routerUpsert(
        packageVersionId: $packageVersionId
        parentId: $parentId
        base: $base
        componentId: $componentId
      ) {
        id
      }
    }  
  `
  const variables = {
    packageVersionId, parentId, base, componentId
  }

  const response = await request({ query, variables })
  return response.data.data.routerUpsert
}
