import clone from "../../util/clone.js"
import { packageVersionGet } from "../../util/package-version.js"

export default async function() {
  const packageVersion = await packageVersionGet({ usePackageCredentials: true })

  await clone({
    toPath: './',
    packageVersionId: packageVersion.id,
    shouldCreateFrontendFiles: true,
    shouldCreateConfigFile: false,
    shouldCreateDir: false
  })

  // TODO: this should change to truffle.site when using production
  console.log(`You can access this site at: https://package-version-${packageVersion.id}.sporocarp.dev`)
}