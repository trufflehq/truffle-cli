import path from 'path'

export async function getConfig () {
  const publicConfig = await getConfigJson('truffle.config')

  if (publicConfig.secretKey) {
    throw new Error('Secret key must go in truffle.secret.js')
  }
  const secretConfig = await getConfigJson('truffle.secret')
  return { ...publicConfig.default, ...secretConfig.default }
}

async function getConfigJson (prefix) {
  let config
  try {
    config = await import(path.join(process.cwd(), `./${prefix}.js`))
  } catch {
    config = await import(path.join(process.cwd(), `./${prefix}.mjs`))
  }
  return config
}
