import { getPackageConfig, getGlobalConfig, kProfile } from './config.js'
import FormData from 'form-data'
import fetch from 'node-fetch'
import { container } from 'tsyringe'

export interface RequestOptions {
  query: string;
  variables?: Record<string, unknown>;
  shouldUseGlobal?: boolean;
  maxAttempts?: number;
}

interface BaseGraphQLResponse {
  errors?: { message: string; extensions: { info: string }}[]
  data: Record<string, unknown>
}

export async function request ({ query, variables, shouldUseGlobal = false, maxAttempts = 1 }: RequestOptions): Promise<any> {
  const profile = container.resolve<string>(kProfile)

  const { apiUrl, secretKey } = shouldUseGlobal ? getGlobalConfig(profile) : await getPackageConfig() || getGlobalConfig(profile)
  let response
  let attemptsLeft = maxAttempts
  while ((!response || response.status !== 200) && attemptsLeft > 0) {
    if (response?.status) {
      console.log('Retrying. Last attempt:', response.status)
    }
    attemptsLeft -= 1
    response = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify({ query, variables }),
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    })
  }

  // console.log(chalk.gray(`[request] POST ${new URL(apiUrl).pathname} ${response.status} ${response.statusText}`))
  const data = await response.json() as BaseGraphQLResponse
  if (data?.errors?.length) {
    throw new Error(`Request error: ${
      JSON.stringify(
        data.errors[0].extensions?.info ?? data.errors[0].message
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

export async function upload ({ query, variables, bundle, shouldUseGlobal = false }: UploadOptions): Promise<any> {
  const profile = container.resolve<string>(kProfile)

  const { apiUrl, secretKey } = shouldUseGlobal ? getGlobalConfig(profile) : await getPackageConfig() || getGlobalConfig(profile)
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
  // console.log(chalk.gray(`[request] POST ${new URL(apiUrl).pathname} ${response.status} ${response.statusText}`))

  const data = await response.json() as BaseGraphQLResponse
  if (data?.errors?.length) {
    throw new Error(`Request error: ${
      JSON.stringify(
        data.errors[0].extensions?.info ?? data.errors[0].message
      )
    }`)
  }
  return data
}
