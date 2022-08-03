import { getPackageConfig, getGlobalConfig } from './config.js'
import FormData from 'form-data'
import fetch from 'node-fetch'

export interface RequestOptions {
  query: string;
  variables?: Record<string, unknown>;
  shouldUseGlobal?: boolean;
}

interface BaseGraphQLResponse {
  errors?: { message: string; extensions: { info: string }}[]
}

export async function request ({ query, variables, shouldUseGlobal = false }: RequestOptions): Promise<any> {
  const { apiUrl, secretKey } = shouldUseGlobal ? getGlobalConfig() : await getPackageConfig() || getGlobalConfig()
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json'
    }
  })
  const data = await response.json() as BaseGraphQLResponse
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

export async function upload ({ query, variables, bundle, shouldUseGlobal = false }: UploadOptions) {
  const { apiUrl, secretKey } = shouldUseGlobal ? getGlobalConfig() : await getPackageConfig() || getGlobalConfig()
  const url = new URL(apiUrl)
  url.pathname = '/upload'
  url.searchParams.set('graphqlQuery', query)
  if (variables) url.searchParams.set('variables', JSON.stringify(variables))

  const form = new FormData()
  form.append('file', Buffer.from(bundle))

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      authorization: `Bearer ${secretKey}`,
      ...form.getHeaders()
    },
    body: form.getBuffer()
  })

  const data = await response.json() as BaseGraphQLResponse
  if (data?.errors?.length) {
    throw new Error(`Request error: ${
      JSON.stringify(
        data.errors[0].extensions.info ?? data.errors[0].message
      )
    }`)
  }
  return data
}
