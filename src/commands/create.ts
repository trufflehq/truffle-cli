import fork from './fork.js'

export default async function create (
  {
    toPackageSlug,
    shouldCreateSporocarpFiles
  }:
  {
    toPackageSlug: string,
    shouldCreateSporocarpFiles?: boolean
  }) {
  await fork({
    packagePath: '@truffle/create-react-project',
    toPackageSlug,
    shouldCreateSporocarpFiles
  })
}
