import { deploy } from "../deploy.js";

export default async function() {
  await deploy({
    shouldUpdateDomain: true,
    shouldOnlyUploadConfig: false
  })
}