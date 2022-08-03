import { request } from './request.js'

export async function domainGetConnection ({ packageVersionId }: { packageVersionId: string }) {
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
  return response.data.domainConnection as { nodes: { id: string, domainName: string, packageVersionId: string }[] }
}

export async function domainMigrate ({ fromPackageVersionId, toPackageVersionId }: { fromPackageVersionId: string, toPackageVersionId: string }) {
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
  return response.data.domainMigratePackageVersionId as { id: string, domainName: string, packageVersionId: string }
}
