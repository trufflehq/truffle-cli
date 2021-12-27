import fs from 'fs'

import { setConfig, componentGetAll } from './spore_sdk.js'

export default async function () {
  await setConfig()

  const componentConnection = await componentGetAll()
  componentConnection.nodes.forEach(async (component) => {
    const path = `components/${component.collection?.slug || 'global'}/${component.slug}`
    await fs.mkdirSync(path, { recursive: true })
    fs.writeFileSync(`${path}/index.jsx`, component.jsx || '')
    fs.writeFileSync(`${path}/index.scss`, component.sass || '')
    const config = {
      id: component.id,
      componentTemplateId: component.componentTemplateId,
      slug: component.slug,
      type: component.type,
      data: component.data
    }
    fs.writeFileSync(`${path}/config.json`, JSON.stringify(config, null, 2))
  })
}
