import fs from 'fs'
import path from 'path'

import { packageVersionGet } from './util/package-version.js'

// packageVersionId optional, uses config file if not spec'd
export default async function clone ({ packageVersionId, packageCombinedSlug } = {}) {
  // packageCombinedSlug is @<org-slug>/<package-slug>
  const packageVersion = await packageVersionGet({ id: packageVersionId, combinedSlug: packageCombinedSlug })

  const packagePath = path.resolve('./', packageVersion.package.slug)
  fs.mkdirSync(packagePath)

  packageVersion.moduleConnection.nodes.forEach((module) => {
    const filename = `.${module.filename}`
    fs.mkdirSync(path.dirname(filename), { recursive: true })
    fs.writeFileSync(path.resolve(filename), module.code)
  })

  console.log(`Created, now you can cd into ${packagePath}`)
}
