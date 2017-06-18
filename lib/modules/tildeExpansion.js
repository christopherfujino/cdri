const path = require('path')

export function tildeExpansion (input) {
  let parsed = input.replace(/~/, process.env.HOME)
  parsed.replace(/^\.\//, process.cwd() + '/')
  // .. not parsed
  return parsed
}
