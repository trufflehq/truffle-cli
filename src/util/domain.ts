import { request } from './request.js'

export async function domainGetConnection ({ packageVersionId }: { packageVersionId: string }) {
  const query = `
    query DomainGetConnection($input: DomainConnectionInput) {
      domainConnection(input: $input) {
        nodes {
          id
          domainName
          packageVersionId
        }
      }
    }
  `
  const variables = { input: { packageVersionId } }

  const response = await request({ query, variables })
  return response.data.domainConnection as { nodes: { id: string, domainName: string, packageVersionId: string }[] }
}

export async function domainMigrate ({ packageId, toPackageVersionId }: { packageId: string, toPackageVersionId: string }) {
  const query = `
    mutation DomainMigratePackageVersionId($input: DomainMigratePackageVersionIdInput!) {
      domainMigratePackageVersionId(input: $input) {
        domains {
          id
          domainName
          packageVersionId
        }
      }
    }
  `
  const variables = { input: { packageId, toPackageVersionId } }

  const response = await request({ query, variables })
  return response.data.domainMigratePackageVersionId.domains as { id: string, domainName: string, packageVersionId: string }
}
