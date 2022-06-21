import { request } from './request.js'

export async function domainGetConnection ({ packageVersionId }) {
  const query = `
    query DomainGetConnection($packageVersionId: ID) {
      domainConnection(packageVersionId: $packageVersionId) {
        nodes {
          id
          domainName
          packageVersionId
        }
      }
    }
  `
  const variables = { packageVersionId }

  const response = await request({ query, variables })
  return response.data.data.domainConnection
}

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
