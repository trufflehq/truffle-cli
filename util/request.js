import axios from 'axios'
import { getPackageConfig, getGlobalConfig } from './config.js'

export async function request ({ query, variables, shouldUseGlobal = false }) {
  const { apiUrl, secretKey } = shouldUseGlobal ? getGlobalConfig() : await getPackageConfig() || getGlobalConfig()

  const response = await axios.post(apiUrl, { query, variables }, {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json'
    }
  })
  if (response?.data?.errors?.length) {
    throw new Error(`Request error: ${
      JSON.stringify(
        response.data.errors[0].extensions.info || response.data.errors[0].message
      )
    }`)
  }
  return response
}

export async function upload ({ query, variables, form, shouldUseGlobal = false }) {
  const { apiUrl, secretKey } = shouldUseGlobal ? getGlobalConfig() : await getPackageConfig() || getGlobalConfig()
  const url = new URL(apiUrl)
  url.pathname = '/upload'

  const response = await axios.post(url.toString(), { graphqlQuery: query, variables }, {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json'
    },
    body: form
  })
  if (response?.data?.errors?.length) {
    throw new Error(`Request error: ${
      JSON.stringify(
        response.data.errors[0].extensions.info || response.data.errors[0].message
      )
    }`)
  }
  return response
}
