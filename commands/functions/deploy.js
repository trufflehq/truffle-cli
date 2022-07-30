
import { getPackageConfig } from '../../util/config.js'
import chalk from 'chalk'
import { packageGet } from '../../util/package.js'
import { createDeployment, createEsZIP, upsertFunction } from '../../util/functions.js'
import readline from 'readline'
import FormData from '@discordjs/form-data'

const debug = (message) => console.log(chalk.blue(message))

export default async function deploy ({ functionName, all } = {}) {
  const pkgConfig = await getPackageConfig()
  if (!pkgConfig) {
    console.log(chalk.red`package config not found, make sure truffle.config.mjs exists`)
    return
  }
  const pkg = await packageGet()
  const packageId = pkg.id

  if (!pkgConfig.functions.length) {
    console.log(chalk.red`No functions found in package config`)
    return
  }

  /**
   * Handles upserting a function and creates a deployment
   * @param {TruffleFunction} fn The truffle function in iteration
   */
  const handleFunction = async (fn) => {
    debug('here P')
    const { name, description, entrypoint } = fn
    const upsertedFn = await upsertFunction({ name, description, packageId })
    debug('upserted function')

    debug(`process.cwd(): ${process.cwd()}`)
    debug(`entrypoint: ${entrypoint}`)
    const ep = new URL(entrypoint, 'file://')
    const build = await createEsZIP(ep)
    debug('created eszip')
    const form = new FormData()
    form.append('file', build, { filename: 'build.eszip2' })

    const deployment = await createDeployment({ packageId, functionId: upsertedFn.id, entrypoint }, form)
    debug('created deployment')
    console.dir(deployment)

    console.log(chalk.green(`Truffle Function ${name} has been deployed!`))
    console.log(chalk.green(`Deployment ID: ${deployment.id}`))
    const shouldPromote = await new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      rl.question(chalk.green(`Promote to production? [y/N]`), (answer) => {
        rl.close()
        resolve(answer.toLowerCase() === 'y')
      })
    })

    if (shouldPromote) {
      await upsertFunction({ id: upsertedFn.id, productionDeploymentId: deployment.id })
      console.log(chalk.green(`Deployment ${deployment.id} has been promoted to production`))
    }
  }

  if (all) {
    debug('here c')
    for (const fn of pkgConfig.functions) {
      await handleFunction(fn)
    }
  } else {
    const fn = pkgConfig.functions.find(fn => fn.name === functionName)
    if (!fn) {
      debug('here b')
      console.log(chalk.red(`Function ${functionName} not found in package config`))
      console.log(chalk.red(`Options: ${pkgConfig.functions.map(fn => fn.name).join(', ')}`))
      return
    }
    debug('here a')
    await handleFunction(fn)
  }
}
