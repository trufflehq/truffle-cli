import watchGlob from 'watch-glob'
import glob from 'glob'
import fs from 'fs'

import { moduleUpsert } from './truffle-sdk.js'

const GLOB = '**/*.@(js|jsx|scss|json)'
const IGNORE = [
  'node_modules/**/*', '.git/**/*', '*.secret.js', 'package.json', 'package-lock.json', 'tsconfig.json'
]

export async function deploy () {
  glob(GLOB, { ignore: IGNORE }, async (err, filenames) => {
    if (err) throw err
    for (const filename of filenames) await handleFilename(filename)
  })
}

export async function watch () {
  watchGlob([GLOB], { ignore: IGNORE, callbackArg: 'relative' }, handleFilename)
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

async function handleFilename (filename) {
  console.log('File changed:', filename)
  if (filename.indexOf('.secret.js') !== -1) {
    console.log('skipping secret file')
  }
  const filenameParts = filename.split('/')
  filenameParts.pop()
  const path = filenameParts.join('/')
  let moduleConfig = {}
  try {
    moduleConfig = JSON.parse(fs.readFileSync(`${path}/module.config.json`).toString())
  } catch {}
  const code = fs.readFileSync(filename).toString()
  const { id, type } = moduleConfig
  try {
    await moduleUpsert(pickBy({
      id,
      filename: `/${filename}`,
      type,
      code
    }))
  } catch (err) {
    console.log('failed upsert for', filename, err)
  }
  console.log(`Saved ${filename}`)
}
