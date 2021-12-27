import watch from 'node-watch'
import fs from 'fs'

import { setConfig, componentUpsert } from './spore_sdk.js'

export default async function () {
  await setConfig()
  watch('./components', { recursive: true }, async (event, name) => {
    // event is `update` or `remove`
    if (event === 'remove') {
      console.log('File removed (noop)')
    }
    console.log('File changed:', name)
    const nameParts = name.split('/')
    nameParts.pop()
    const path = nameParts.join('/')
    const slug = nameParts[nameParts.length - 1]
    const jsx = fs.readFileSync(`${path}/index.jsx`).toString()
    const sass = fs.readFileSync(`${path}/index.scss`).toString()
    const meta = JSON.parse(fs.readFileSync(`${path}/config.json`).toString())
    const id = meta.id
    await componentUpsert({ id, jsx, sass })
    console.log(`Saved ${slug}`)
  })

  console.log('Listening for changes...')
}
