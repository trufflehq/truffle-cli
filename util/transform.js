// we compile here (https://github.com/trufflehq/oscar) oscar doesn't have to
// worry about handling css in perpetuity
import { isSassJsFile, replaceSassLiteralWithCssLiteral } from 'truffle-dev-server/src/utils/sass.js'

export function applyTransforms (filename, code) {
  if (isSassJsFile(filename)) {
    code = replaceSassLiteralWithCssLiteral(code)
  }
  return code
}
