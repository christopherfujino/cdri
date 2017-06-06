const path = require('path')

export function tildeExpansion (input) {
  let parsed = input.replace(/~/, process.env.HOME)
  return path.normalize(parsed) // to transform . or ..
}
