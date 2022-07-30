import { request, upload } from "./request.js"
import { build } from "@deno/eszip"
import { readFile } from 'fs/promises'

/**
 *
 * @param {object} input The input for upserting the function
 * @param {string} input.id The ID of the function
 * @param {string} [input.name] The name of the function
 * @param {string} [input.description] The description of the function
 * @param {string} input.slug The slug of the function
 * @param {string} input.packageId The ID of the package the function belongs to
 * @param {string} input.orgId The ID of the organization the function belongs to
 * @returns {Promise<{ id: string; name: string; orgId: string; packageId: string; description?: string; productionDeploymentId?: string;}>} The upserted function
 */
export async function upsertFunction (input) {
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
  return resp.data.data.upsertFunction
}

export async function createDeployment ({ id, packageId, functionId, entrypoint }, form) {
  const query = `
    mutation CreateDeployment($input: CreateDeploymentInput!) {
      createDeployment(input: $input) {
        id
        name
      }
    }
  `
  const resp = await upload({ query, variables: { input: { id, packageId, functionId, entrypoint } }, form })
  return resp.data.data.createDeployment
}

/**
 * Create an eszip for the function
 * @param {URL} entrypoint The function entrypoint
 * @returns {Promise<Uint8Array>} The eszip2 file
 */
export async function createEsZIP (entrypoint) {
  return build([entrypoint.toString()], async (spec) => {
    const url = new URL(spec)
    if (url.protocol === "file:") {
      const content = await readFile(url)
      return {
        specifier: url.toString().replace(process.cwd(), ""),
        content,
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
