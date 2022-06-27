import fork from './fork.js'

export default async function create ({ toPackageSlug }) {
  await fork({ packagePath: '@truffle/default-site', toPackageSlug })
}
