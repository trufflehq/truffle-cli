import path from "path"
import { rootPath } from "./package-path.js"

/**
 * Dynamically load an action from a path
 * @param actionPath 
 * @returns 
 */
export function actionLoader (actionPath: string) {
  const absolutePath = path.normalize(path.join(rootPath, actionPath))
  return async (...args: unknown[]) => {
    const { default: action } = await import(absolutePath)
    await action(...args)
  }
}