import { startServer } from 'truffle-dev-server'

import { packageVersionGet } from './util/package-version.js'

export default async function dev () {
  const packageVersion = await packageVersionGet()
  startServer({ packageVersion })
}
