/**
 * gitignore-to-glob
 * https://github.com/EE/gitignore-to-glob
 *
 * Author Michał Gołębiowski-Owczarek <m.goleb@gmail.com>
 * Licensed under the MIT license.
 */

import { readFileSync } from "fs"
import { resolve } from "path"

export function gitIgnoreToGlob (path?: string, dirsToCheck?: string[]) {
  const ignore = resolve(path ?? ".gitignore")
  return readFileSync(ignore, { encoding: "utf8" }).split("\n")
    .filter((pattern) => !!pattern && pattern[0] !== "#")
    .map((pattern) =>
      pattern[0] === "!" ? ["", pattern.substring(1)] : [pattern]
    )
    .filter(
      ([_, pattern]) =>
        pattern.indexOf("/.") === -1 && pattern.indexOf(".") !== 0
    )
    .filter((patternPair) => {
      const pattern = patternPair[1]
      if (pattern[0] !== "/") {
        return [
          patternPair[0],
            `${dirsToCheck ? `{${dirsToCheck}}/` : ""}**/${pattern}`
        ]
      }
      return [patternPair[0], pattern.substring(1)]
    })
    .reduce((result, patternPair) => {
      const pattern = patternPair.join("")
      result.push(pattern)
      result.push(`${pattern}/**`)
      return result
    }, [])
}
