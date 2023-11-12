import path from "path"

const rootPath = path.normalize(path.join(import.meta.url, '..', '..'))

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