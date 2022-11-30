import { startServer } from 'truffle-dev-server'

import { packageVersionGet, packageVersionPathGetLatestPath } from '../util/package-version.js'

export default async function dev () {
  const majorVersion = parseInt(process.version.match(/v([0-9]+)/)![1])
  if (majorVersion < 18) {
    throw new Error('Must use Node 18+')
  }
  const packageVersion = await packageVersionGet({
    packagePath: await packageVersionPathGetLatestPath()
  })

  startServer({ packageVersion })
}
