import { request } from './request.js'

export async function domainMigrate ({ fromPackageVersionId, toPackageVersionId }) {
  const query = `
    mutation DomainMigratePackageVersionId($fromPackageVersionId: ID, $toPackageVersionId: ID) {
      domainMigratePackageVersionId(fromPackageVersionId: $fromPackageVersionId, toPackageVersionId: $toPackageVersionId) {
        id
        domainName
        packageVersionId
      }
    }
  `
  const variables = { fromPackageVersionId, toPackageVersionId }

  const response = await request({ query, variables })
  return response.data.data.domainMigratePackageVersionId
}
