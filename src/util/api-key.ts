import { request } from './request.js'

export interface CreateAPIKeyInput {
  type: 'secret' | 'publishable';
  sourceType: 'org' | 'package';
  sourceId: string;
}

export async function apiKeyCreate ({ type, sourceType, sourceId }: CreateAPIKeyInput) {
  const query = `
    mutation PackageInstallCreate($input: ApiKeyCreateInput!) {
      apiKeyCreate(input: $input) { apiKey { key } }
    }`
  const variables = {
    input: { type, sourceType, sourceId }
  }

  const response = await request({ query, variables, shouldUseGlobal: true })
  return response.data.apiKeyCreate as { apiKey: { key: string } }
}
