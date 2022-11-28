import { request } from './request.js'

export interface ModuleUpsertInput {
  id?: string;
  packageVersionId?: string;
  filename?: string;
  runtime?: 'react' | string;
  code?: string;
}

export async function moduleUpsert ({ packageVersionId, id, filename, runtime = 'react', code }: ModuleUpsertInput) {
  if (code?.includes('sk_')) {
    throw new Error('It looks like you\'re trying to deploy code with a secret key')
  }

  const query = `
    mutation ModuleUpsert($input: ModuleUpsertInput!) {
      moduleUpsert(input: $input) {
        module {
          id, exports { type, componentRel { id } }
        }
      }
    }`

  const variables = {
    input: { id, packageVersionId, filename, runtime, code }
  }
  try {
    const response = await request({ query, variables, maxAttempts: 3 })
    return response.data.moduleUpsert.module
  } catch (err) {
    console.error('error upserting module', err)
  }
}
