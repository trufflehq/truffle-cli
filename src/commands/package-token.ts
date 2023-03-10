import { packageInstallGet, packageInstallTokenGet } from "../util/package-install.js";

export default async function () {
  const packageInstall = await packageInstallGet();

  if (!packageInstall) {
    console.error("No package install found. You might have to deploy it first.");
    return;
  }

  console.log(`Retrieving auth token for package install ${packageInstall.id}\n`);

  const token = await packageInstallTokenGet(packageInstall.id);
  console.log(token);
}