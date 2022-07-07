import { packageInstallCreate } from './util/package-install.js'
import chalk from 'chalk'
export default async function install ({ installedPackageVersionPath, isForceInstall = false } = {}) {
  const { packageInstall, userErrors } = await packageInstallCreate({ installedPackageVersionPath, isForceInstall })

  const installStatus = packageInstall?.installStatus

  if (installStatus === 'installed') {
    console.log(chalk.green.bold('Package installed!'))
  } else if (installStatus === 'installing') {
    console.log(chalk.yellow('Package is caught installing'))
  } else {
    const reason = JSON.stringify(userErrors)
    console.log(chalk.red.bold(`Package install failed (${reason})`))
  }
}
