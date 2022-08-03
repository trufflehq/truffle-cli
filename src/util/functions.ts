import { request, upload } from "./request.js"
import { build, LoadResponse } from "@deno/eszip"
import { readFile } from 'fs/promises'
import { fetch } from 'undici'

export interface UpsertFunctionInput {
  id?: string;
  name?: string;
  description?: string;
  slug?: string;
  packageId?: string;
  // pulled in from context
  orgId?: string;
  productionDeploymentId?: string;
}

export async function upsertFunction (input: UpsertFunctionInput): Promise<{ id: string; name: string; orgId: string; packageId: string; description?: string; productionDeploymentId?: string; }> {
  const query = `
    mutation UpsertFunction($input: UpsertFunctionInput!) {
      upsertFunction(input: $input) {
        id
        name
        orgId
        packageId
        description
        productionDeploymentId
      }
    }
  `
  const resp = await request({ query, variables: { input } })
  return resp.data.upsertFunction
}

interface CreateDeploymentInput {
  id?: string;
  packageId: string;
  functionId: string;
  entrypoint: string;
}

export async function createDeployment (input: CreateDeploymentInput, bundle: ArrayBufferLike) {
  const query = `
mutation CreateDeployment($input: CreateDeploymentInput!) {
  createDeployment(input: $input) {
    id
  }
}
`
  console.log('here 123')
  const resp = await upload({ query, variables: { input }, bundle })
  console.log('here 456')
  return resp.data.createDeployment
}

export async function createEsZIP (entrypoint: URL) {
  return build([entrypoint.toString()], async (spec): Promise<LoadResponse | undefined> => {
    const url = new URL(spec)
    if (url.protocol === "file:") {
      const content = await readFile(url)
      return {
        specifier: url.toString().replace(process.cwd(), ""),
        content: content.toString(),
        kind: "module"
      }
    }

    const response = await fetch(String(url), { redirect: "follow" })
    if (response.status !== 200) {
      // ensure the body is read as to not leak resources
      await response.arrayBuffer()
      return undefined
    }
    const content = await response.text()
    const headers = {}
    for (const [key, value] of response.headers) {
      headers[key.toLowerCase()] = value
    }
    return {
      kind: "module",
      specifier: response.url,
      headers,
      content
    }
  })
}
