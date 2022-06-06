import fs from 'fs'
import path from 'path'

import { packageVersionGet } from './truffle-sdk.js'

export default async function clone () {
  const packageVersion = await packageVersionGet()
  console.log('module', JSON.stringify(packageVersion.moduleConnection.nodes, null, 2))

  packageVersion.moduleConnection.nodes.forEach((module) => {
    if (module.filename === '/truffle.config.js') {
      console.log('skipping config file')
      return
    }
    const filename = `.${module.filename}`
    fs.mkdirSync(path.dirname(filename), { recursive: true })
    fs.writeFileSync(path.resolve(filename), module.code)
  })
}
