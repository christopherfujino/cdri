const path = require('path')

export function tildeExpansion (input) {
  let parsed = input.replace(/~/, process.env.HOME)
  parsed = path.normalize(parsed)
  return input.replace(/~/, process.env.HOME)
}
