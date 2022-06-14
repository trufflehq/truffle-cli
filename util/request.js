import axios from 'axios'
import { getPackageConfig, getGlobalConfig } from './config.js'

export async function request ({ query, variables }) {
  const { apiUrl, secretKey } = await getPackageConfig() || getGlobalConfig()
  console.log(apiUrl, secretKey)
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
