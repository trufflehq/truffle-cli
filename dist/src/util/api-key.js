import { request } from './request.js';
export async function apiKeyCreate({ type, sourceType, sourceId }) {
    const query = `
    mutation PackageInstallCreate($input: ApiKeyCreateInput!) {
      apiKeyCreate(input: $input) { apiKey { key } }
    }`;
    const variables = {
        input: { type, sourceType, sourceId }
    };
    const response = await request({ query, variables, shouldUseGlobal: true });
    return response.data.apiKeyCreate;
}
//# sourceMappingURL=api-key.js.map