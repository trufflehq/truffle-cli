import { packageInstallCreate } from './util/package-install.js'

export default async function install ({ installedPackageVersionPath } = {}) {
  await packageInstallCreate({ installedPackageVersionPath })
  console.log('Package installed!')
}
