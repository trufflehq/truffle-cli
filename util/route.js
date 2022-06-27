import fs from 'fs'

import { request } from './request.js'
import { moduleUpsert } from './module.js'

export async function routeUpsert ({ packageVersionId, pathWithVariables, parentId, componentId, data }) {
  const query = `
    mutation RouteUpsert(
      $packageVersionId: ID
      $pathWithVariables: String
      $parentId: ID
      $componentId: ID
      $data: JSON
    ) {
      routeUpsert(
        packageVersionId: $packageVersionId
        pathWithVariables: $pathWithVariables
        parentId: $parentId
        componentId: $componentId
        data: $data
      ) {
        id
      }
    }  
  `
  const variables = {
    pathWithVariables, packageVersionId, parentId, componentId, data
  }

  const response = await request({ query, variables })
  return response.data.data.routeUpsert
}

export async function saveRoute ({ filenameParts, module, packageVersionId }) {
  const defaultExportComponentId = module.exports.find(({ type }) => type === 'default')?.componentRel?.id

  const filenamePath = `/${filenameParts.slice(1, filenameParts.length - 1).join('/')}`
  const pathParts = filenamePath.split('/')
  const paths = pathParts.map((routerPath, i) => `${pathParts.slice(0, i + 1).join('/')}`)
  let prevRoute
  // create a top level router and another router for any folders w/ layout.tsx
  await Promise.all(paths.map(async (path, i) => {
    const parent = prevRoute
    // FIXME: support .ts|.jsx|.js too
    const layoutFilename = `/routes${path}/layout.tsx`
    let hasLayoutFile, code
    try {
      code = fs.readFileSync(path.normalize(`.${layoutFilename}`)).toString()
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

    if (hasLayoutFile) {
      prevRoute = await routeUpsert({
        packageVersionId,
        parentId: parent?.id,
        pathWithVariables: path,
        componentId: layoutDefaultExportComponentId,
        data: { isLayout: true }
      })
    }
  }))

  await routeUpsert({
    packageVersionId,
    parentId: prevRoute?.id,
    pathWithVariables: `/${filenameParts.slice(1, filenameParts.length - 1).join('/')}`,
    componentId: defaultExportComponentId
  })
}
