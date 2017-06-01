export function tildeExpansion (input) {
  return input.replace(/~/, process.env.HOME)
}
