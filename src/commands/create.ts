import fork from './fork.js'

export default async function create ({ toPackageSlug }: { toPackageSlug: string }) {
  await fork({ packagePath: '@truffle/create-react-project', toPackageSlug })
}
