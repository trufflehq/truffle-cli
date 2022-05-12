import fs from 'fs'

import { getConfig } from './config.js'
import { componentGetAllByPackageId } from './spore_sdk.js'

// TODO: read truffle.config.js for orgId, packageId

export default async function () {
  const { packageId } = await getConfig()
  const componentConnection = await componentGetAllByPackageId(packageId)
  componentConnection.nodes.forEach(async (component) => {
    const dir = component.type === 'page' ? 'pages' : 'components'
    const path = `${dir}/${component.slug}`
    await fs.mkdirSync(path, { recursive: true })
    fs.writeFileSync(`${path}/index.jsx`, component.jsx || '')
    fs.writeFileSync(`${path}/index.scss`, component.sass || '')
    const config = {
      id: component.id,
      componentTemplateId: component.componentTemplateId,
      slug: component.slug,
      name: component.name,
      type: component.type,
      data: component.data,
      propTypes: component.propTypes
    }
    fs.writeFileSync(`${path}/config.json`, JSON.stringify(config, null, 2))
  })
}
