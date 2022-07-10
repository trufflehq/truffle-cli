import fs from 'fs'
// JSDom screws with "path" name
import nodePath from 'path'

import { request } from './request.js'
import { moduleUpsert } from './module.js'

export async function routeUpsert ({ packageVersionId, pathWithVariables, parentId, componentId, type, data }) {
  const query = `
    mutation RouteUpsert($input: RouteUpsertInput!) {
      routeUpsert(input: $input) {
        route { id }
      }
    }  
  `
  const variables = {
    input: { pathWithVariables, packageVersionId, parentId, componentId, data, type }
  }

  const response = await request({ query, variables })
  return response.data.data.routeUpsert.route
}

export async function saveRoute ({ filenameParts, module, packageVersionId }) {
  const defaultExportComponentId = module.exports.find(({ type }) => type === 'default')?.componentRel?.id

  const filenamePath = `/${filenameParts.slice(1, filenameParts.length - 1).join('/')}`
  const dbPath = filenamePath
    // nextjs style catch alls `[...slug]`. dir names can't be * on windows
    // TODO: support the difference between [[...slug]] and [...slug]
    // https://nextjs.org/docs/routing/dynamic-routes#optional-catch-all-routes)
    .replace(/\[?\[\.\.\.(.*?)\]\]?/g, '*')
    // /abc/[param] -> /abc/:param
    .replace(/\[(.*?)\]/g, ":$1")
  const pathParts = dbPath.split('/')
  const fileParts = filenamePath.split('/')
  const paths = pathParts.map((routerPath, i) => `${pathParts.slice(0, i + 1).join('/')}`)
  const filenames = fileParts.map((routerPath, i) => `${fileParts.slice(0, i + 1).join('/')}`)
  let prevRoute
  // create a top level router and another router for any folders w/ layout.tsx
  for await (const [i, path] of paths.entries()) {
    if (path === '/') { break } // we already upsert one for path = ''

    // FIXME: support .ts|.jsx|.js too
    const layoutFilename = `/routes${filenames[i]}/layout.tsx`
    let hasLayoutFile, code
    try {
      code = fs.readFileSync(nodePath.normalize(`.${layoutFilename}`)).toString()
      hasLayoutFile = true
    } catch {}

    let layoutDefaultExportComponentId
    if (hasLayoutFile) {
      const layoutModule = await moduleUpsert({
        packageVersionId,
        filename: layoutFilename,
        code
      })
      layoutDefaultExportComponentId = layoutModule.exports.find(({ type }) => type === 'default')?.componentRel?.id
    }

    prevRoute = await routeUpsert({
      packageVersionId,
      parentId: prevRoute?.id,
      pathWithVariables: path,
      componentId: layoutDefaultExportComponentId,
      type: hasLayoutFile ? 'layout' : 'empty'
    })
  }

  await routeUpsert({
    packageVersionId,
    parentId: prevRoute?.id,
    pathWithVariables: pathParts.join('/'),
    componentId: defaultExportComponentId,
    type: 'page'
  })
}
