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
