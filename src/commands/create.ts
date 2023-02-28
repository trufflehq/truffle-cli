import fork from './fork.js'

export default async function create (
  {
    toPackageSlug,
    shouldCreateFrontendFiles
  }:
  {
    toPackageSlug: string,
    shouldCreateFrontendFiles?: boolean
  }) {
  await fork({
    packagePath: '@truffle/create-react-project',
    toPackageSlug,
    shouldCreateFrontendFiles
  })
}
