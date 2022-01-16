import watch from 'node-watch'
import fs from 'fs'

import { setConfig, componentUpsert } from './spore_sdk.js'

export default async function () {
  await setConfig()
  watch('./components', { recursive: true }, async (event, filename) => {
    // event is `update` or `remove`
    if (event === 'remove') {
      console.log('File removed (noop)')
    }
    console.log('File changed:', filename)
    const filenameParts = filename.split('/')
    filenameParts.pop()
    const path = filenameParts.join('/')
    const folderName = filenameParts[filenameParts.length - 1]
    const jsx = fs.readFileSync(`${path}/index.jsx`).toString()
    const sass = fs.readFileSync(`${path}/index.scss`).toString()
    const componentConfig = JSON.parse(fs.readFileSync(`${path}/config.json`).toString())
    const { id, slug, name, componentTemplateId, type, data, propTypes } = componentConfig
    await componentUpsert(pickBy({
      id,
      slug: slug || folderName,
      name,
      componentTemplateId,
      type,
      data,
      jsx,
      sass,
      propTypes
    }))
    console.log(`Saved ${folderName}`)
  })

  console.log('Listening for changes...')
}

function pickBy (object) {
  const obj = {}
  for (const key in object) {
    if (object[key]) {
      obj[key] = object[key]
    }
  }
  return obj
}
