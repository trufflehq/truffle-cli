import { request as undici } from 'undici'
import { URL } from 'node:url'
import { getPackageConfig, getGlobalConfig } from './config.js'
import fetch from 'node-fetch'

export interface RequestOptions {
  query: string;
  variables?: Record<string, unknown>;
  shouldUseGlobal?: boolean;
}

export async function request ({ query, variables, shouldUseGlobal = false }: RequestOptions): Promise<any> {
  const { apiUrl, secretKey } = shouldUseGlobal ? getGlobalConfig() : await getPackageConfig() || getGlobalConfig()
  const response = await undici(apiUrl, {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json'
    }
  })
  const data = await response.body.json()
  if (data?.errors?.length) {
    throw new Error(`Request error: ${
      JSON.stringify(
        data.errors[0].extensions.info ?? data.errors[0].message
      )
    }`)
  }
  return data
}

export interface UploadOptions {
  query: string;
  variables?: Record<string, unknown>;
  shouldUseGlobal?: boolean;
  bundle: ArrayBufferLike;
}

export async function deploymentUpload ({ query, variables, bundle, shouldUseGlobal = false }: UploadOptions) {
  const { apiUrl, secretKey } = shouldUseGlobal ? getGlobalConfig() : await getPackageConfig() || getGlobalConfig()
  const url = new URL(apiUrl)
  url.pathname = '/deployments/upload'
  url.searchParams.set('graphqlQuery', query)
  if (variables) url.searchParams.set('variables', JSON.stringify(variables))

  console.log('here 2319')
  console.log('POST', url.toString())
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      authorization: `Bearer ${secretKey}`,
      'content-type': 'application/eszip2'
    },
    body: bundle
  })
  console.log('here 1230987')
  const data = await response.json() as any
  if (data?.errors?.length) {
    throw new Error(`Request error: ${
      JSON.stringify(
        data.errors[0].extensions.info ?? data.errors[0].message
      )
    }`)
  }
  return data
}
