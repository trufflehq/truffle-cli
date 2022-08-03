import chalk from 'chalk'
import { join } from 'path'
import readline from 'readline'
import { getPackageConfig } from '../../util/config.js'
import { createDeployment, createEsZIP, upsertFunction } from '../../util/functions.js'
import { packageGet } from '../../util/package.js'

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
function humanFileSize (bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B'
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let u = -1
  const r = 10 ** dp

  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

  return bytes.toFixed(dp) + ' ' + units[u]
}

interface TruffleFunction {
  name: string
  entrypoint: string;
  description?: string
}

const debug = (message: string) => console.log(chalk.blue(message))

export default async function deploy ({ functionName, all }: { functionName?: string, all?: boolean } = {}) {
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

  const handleFunction = async (fn: TruffleFunction) => {
    const { name, description, entrypoint } = fn
    const upsertedFn = await upsertFunction({ name, description, packageId })

    const ep = new URL(join(process.cwd(), entrypoint), 'file://')
    const build = await createEsZIP(ep)
    console.log(chalk.greenBright(`bundle.eszip2 (${humanFileSize(build.byteLength, true)}) created`))

    const deployment = await createDeployment({ packageId, functionId: upsertedFn.id, entrypoint }, build)

    console.log(chalk.greenBright(`Truffle Function ${name} has been deployed!`))
    console.log(chalk.greenBright(`Deployment ID: ${deployment.id}`))
    const shouldPromote = await new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      rl.question(chalk.greenBright(`Promote to production? [y/N]`), (answer) => {
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
