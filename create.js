import fork from './fork.js'

export default async function create ({ toPackageSlug }) {
  await fork({ combinedPackageSlug: '@truffle/default-site', toPackageSlug })
}
