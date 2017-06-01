const fs = require('fs')

export default function (err, data) { //configLoader()
  if (err) throw err
  config = JSON.parse(data)
  configValidator(config, menu)
}

function tildeExpansion (input) {
  return input.replace(/~/, process.env.HOME)
}

function configValidator (config, successCallback) {
  if (!config.dotfiles || !Array.isArray(config.dotfiles) ||
      config.dotfiles.length < 1) {
    console.log('No dotfiles found in config.')
    return
  }
  fs.readdir(process.cwd(), function (err, files) {
    if (err) throw err
    config.dotfiles.forEach(function (dotfile) {
      dotfileValidator(dotfile, files)
    })
    successCallback()
  })  // reads the contents of a directory
}

function dotfileValidator (dotfile, files) {
  if (files.indexOf(dotfile.name) !== -1) { // if file exists
    if (dotfile.platform === undefined || dotfile.platform === 'any' ||
        dotfile.platform === platform) {
      dotfile.target = tildeExpansion(dotfile.target)
      working.dotfiles.push(dotfile)
    } else {
      console.log(`Error: File "${dotfile.name}" is for the platform` +
          dotfile.platform)
    }
  } else {
    console.log(`Error: File "${dotfile.name}" not found!`)
  }
}
