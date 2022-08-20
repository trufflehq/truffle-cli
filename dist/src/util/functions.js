import { request, upload } from "./request.js";
import { build } from "@deno/eszip";
import { readFile } from "fs/promises";
import fetch from "node-fetch";
import chalk from "chalk";
export async function fetchFunctionLogs(functionIds, after = "") {
    const query = `
    query FetchFunctionLogs($functionIds: [ID!]!, $after: String) {
      edgeLogConnection(input: { functionIds: $functionIds }, first: 50, after: $after) {
        nodes {
          id
          orgId
          packageId
          functionId
          deploymentId
          timestamp
          eventType
          body
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
        }
      }
    }
  `;
    const res = await request({ query, variables: { functionIds, after } });
    return res.data.edgeLogConnection;
}
export async function fetchFunction(slug) {
    const query = `
    query FetchEdgeFunction($slug: String!) {
      edgeFunction(slug: $slug) {
        id
        slug
        description
        productionDeploymentId
      } 
    }
  `;
    const res = await request({ query, variables: { slug } });
    return res.data.edgeFunction;
}
export async function upsertFunction(input) {
    console.dir(input);
    const query = `
    mutation UpsertEdgeFunction($input: UpsertFunctionInput!) {
      edgeFunctionUpsert(input: $input) {
        id
        name
        slug
        orgId
        packageId
        description
        productionDeploymentId
      }
    }
  `;
    const resp = await request({ query, variables: { input } });
    console.dir(resp);
    return resp.data.edgeFunctionUpsert;
}
export async function createDeployment(input, bundle) {
    const query = `
mutation CreateDeployment($input: CreateDeploymentInput!) {
  edgeDeploymentCreate(input: $input) {
    id
  }
}
`;
    const resp = await upload({ query, variables: { input }, bundle });
    return resp.data.edgeDeploymentCreate;
}
export async function createEsZIP(entrypoint) {
    console.log(chalk.gray(`[functions::createEsZIP] creating eszip`));
    return build([entrypoint.toString()], async (spec) => {
        const url = new URL(spec);
        if (url.protocol === "file:") {
            console.log(chalk.gray(`[functions::createEsZIP::file] loading ${url.pathname}`));
            const content = await readFile(url);
            return {
                specifier: url.toString().replace(process.cwd(), ""),
                content: content.toString(),
                kind: "module"
            };
        }
        try {
            console.log(chalk.gray(`[functions::createEsZIP::remote] fetching ${url.toString()}`));
            const response = await fetch(String(url), { redirect: "follow" });
            if (response.status !== 200) {
                console.log(chalk.red(`[functions::createEsZIP::remote] [${response.statusText}] ${url.toString()}`));
                console.log(`${url} returned ${response.status}`);
                // ensure the body is read as to not leak resources
                await response.arrayBuffer();
                return undefined;
            }
            const content = await response.text();
            const headers = {};
            for (const [key, value] of response.headers) {
                headers[key.toLowerCase()] = value;
            }
            return {
                kind: "module",
                specifier: response.url,
                headers,
                content
            };
        }
        catch (err) {
            console.error(`error when fetching ${url.toString()}`);
            console.error(err);
            return undefined;
        }
    });
}
//# sourceMappingURL=functions.js.map