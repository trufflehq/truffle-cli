// we compile here (https://github.com/trufflehq/oscar) oscar doesn't have to
// worry about handling css in perpetuity
import { isSassJsFile, replaceSassLiteralWithCssLiteral } from 'truffle-dev-server'

export function applyTransforms (filename: string, code: string) {
  if (isSassJsFile(filename)) {
    code = replaceSassLiteralWithCssLiteral(code)
  }
  return code
}
