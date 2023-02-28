import { getPackageConfig, getOrgProfileConfig, getApiUrl, getCliConfig, getCurrentOrgId } from './config.js'
import FormData from 'form-data'
import fetch from 'node-fetch'
import { container } from 'tsyringe'
import { kProfile } from '../di/tokens.js'

export interface RequestOptions {
  query: string;
  variables?: Record<string, unknown>;
  shouldUseGlobal?: boolean;
  isOrgRequired?: boolean;
  maxAttempts?: number;
}

interface BaseGraphQLResponse {
  errors?: { message: string; extensions: { info: string }}[]
  data: Record<string, unknown>
}

interface GraphQLCredentials {
  apiUrl: string;
  headerProps: {
    'x-access-token'?: string;
    'x-org-id'?: string;
    Authorization?: string;
  };
}

async function getCredentials (shouldUseGlobal: boolean, isOrgRequired: boolean): Promise<GraphQLCredentials> {
  
  const getGlobalCredentials: () => GraphQLCredentials = () => {
    const profile = container.resolve<string>(kProfile)

    // if the user specified an org profile, use that
    if (profile) {
      const { apiUrl, secretKey } = getOrgProfileConfig({ profile })
      return {
        apiUrl,
        headerProps: {
          Authorization: `Bearer ${secretKey}`
        }
      }
      // otherwise use their user access token
    } else {
      const apiUrl = getApiUrl()
      const cliConfig = getCliConfig()
      const userAccessToken = cliConfig.userAccessTokens[apiUrl]
      const orgId = getCurrentOrgId()

      const headerProps = { 'x-access-token': userAccessToken }

      if (!userAccessToken) {
        console.error('No user access token found. Please login with `truffle-cli login`.')
        process.exit(1)
      }

      if (!orgId && isOrgRequired) {
        console.error('No org id found. Please select an org with `truffle-cli org use`.')
        process.exit(1)
      } else if (orgId) {
        headerProps['x-org-id'] = orgId
      }

      return {
        apiUrl,
        headerProps
      }
    }
  }

  const getPackageCredentials: () => Promise<GraphQLCredentials | null> = async () => {
    const res = await getPackageConfig()
    if (!res) return null

    return {
      apiUrl: res.apiUrl,
      headerProps: {
        Authorization: `Bearer ${res.secretKey}`
      }
    }
  }

  return shouldUseGlobal
    ? getGlobalCredentials()
    : await getPackageCredentials() || getGlobalCredentials()
}

export async function request (
  { query, variables, shouldUseGlobal = false, isOrgRequired = true, maxAttempts = 1 }: RequestOptions
  ): Promise<any> {

  const { apiUrl, headerProps } = await getCredentials(shouldUseGlobal, isOrgRequired)

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
        ...headerProps,
        'Content-Type': 'application/json'
      }
    })
  }

  // console.log(chalk.gray(`[request] POST ${new URL(apiUrl).pathname} ${response.status} ${response.statusText}`))
  const data = await response.json() as BaseGraphQLResponse
  
  // console.log({ apiUrl, headerProps, query, variables, data: data.data, errors: data.errors })

  if (data?.errors?.length) {
    const error = data.errors[0].extensions?.info ?? data.errors[0].message
    throw new Error(`Request error: ${
      JSON.stringify(error)
    }`, { cause: error })
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

  const { apiUrl, headerProps } = await getCredentials(shouldUseGlobal, true)

  const url = new URL(apiUrl)
  url.pathname = '/upload'
  url.searchParams.set('graphqlQuery', query)
  if (variables) url.searchParams.set('variables', JSON.stringify(variables))

  const form = new FormData()
  form.append('file', Buffer.from(bundle))

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      ...headerProps,
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
