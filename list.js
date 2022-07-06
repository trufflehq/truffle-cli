import { packageList } from './util/package.js'
import chalk from 'chalk'
import _ from 'lodash'

export default async function list () {
  const packageListConnection = await packageList()

  _.forEach(packageListConnection.nodes, (pkg) => {
    const slug = pkg.slug

    const versions = pkg.packageVersionConnection.nodes

    console.log(chalk.bold(`Package (${slug})`))
    console.log(`id: ${pkg.id}`)
    console.log(`Versions:`)
    _.forEach(versions, (version) => {
      console.log(`${version.semver}`)
    })
  })
}
