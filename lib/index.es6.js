let fs = require('fs')
let config = {}
let exec = require('child_process').exec
let platform = require('os').platform

fs.readFile('config.json', 'utf8', installer)

function installer (err, data) {
  if (err) throw err
  config = JSON.parse(data)
  menu()
}

function menu () {
  console.log('\x1BC\x1B[EJ')
  console.log(splash(`Installing ${config.owner}\'s Dotfiles`))
  config.dotfiles.forEach(function (dotfile, i) {
    if (dotfile.platform === 'any' || dotfile.platform === platform()) {
      let check = ' '
      if (dotfile.checked) {check = 'x'}
      console.log(`${i}. ${dotfile.name} [${check}]`)
    }
  })
  console.log('\nType number to select/unselect dotfile, [q] to quit, [i] to install:')
}

function splash (string) {
  let topBottom = ''
  for (let i = 0; i < string.length + 4; i++) {
    topBottom += '*'
  }
  return `${topBottom}\n* ${string} *\n${topBottom}\n`
}

let stdin = process.openStdin()
stdin.on('data', function (chunk) {
  if (('' + chunk)[0] === 'q') {
    console.log('Exiting without installing dotfiles.')
    process.exit(0)
  }
  if (('' + chunk)[0] === 'i') {
    console.log('install!')
    return
  }
  chunk = +chunk
  if (isNaN(chunk) || chunk >= config.dotfiles.length) return
  config.dotfiles[chunk].checked = !config.dotfiles[chunk].checked
  menu()
})
