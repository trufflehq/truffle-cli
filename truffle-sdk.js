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

export async function packageVersionGet () {
  const { name, version } = await getConfig()

  const packageNameParts = name.split('/')
  const packageSlug = packageNameParts[packageNameParts.length - 1]

  const query = `
    query PackageVersionGet($packageSlug: String, $semver: String) {
      packageVersion(packageSlug: $packageSlug, semver: $semver) {
        moduleConnection {
          nodes {
            filename
            code
          }
        }
      }
    }
  `
  const variables = { packageSlug, semver: version }

  const response = await request({ query, variables })
  return response.data.data.packageVersion
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
