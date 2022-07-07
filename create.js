import fork from './fork.js'

export default async function create ({ toPackageSlug }) {
  await fork({ packagePath: '@truffle/create-react-project', toPackageSlug })
}
