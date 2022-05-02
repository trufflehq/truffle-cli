import path from 'path'

export async function getConfig () {
  const publicConfig = await import(path.join(process.cwd(), './truffle.config.js'))
  if (publicConfig.secretKey) {
    throw new Error('Secret key must go in truffle.secret.js')
  }
  const secretConfig = await import(path.join(process.cwd(), './truffle.secret.js'))
  return { ...publicConfig.default, ...secretConfig.default }
}
