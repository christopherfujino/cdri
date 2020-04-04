const fs = require('fs')
const clearScreen = '\u001b[2J\u001b[0;0H'
import yesOrNo from './yesOrNo.js'
import rl from './rl.js'

export default function (configName) {  // create a new repository
  fs.readFile(configName, 'utf8', (err) => {
    if (err) {
      stdin.removeAllListeners('data')
      init(configName)
    } else {
      rl.write(clearScreen)
      yesOrNo(`${configName} file already exists! Would you like to\
overwrite (y/n)? `, (bool) => {
        if (bool) {
          fs.unlink(configName, (err) => {
            if (err) throw err
            rl.write('blah')
          })
        } else {
          rl.write('To run cdri using existing config.json, simply run the command in this directory\n')
          process.exit(0)
        }
      })
    }
  })
}

function configAdder (file) {  // check if we want to add to configName,
                              // add if so
/*
  process.stdout.write('Would you like to add file ' + file +
      ' to config (y/n)? ')
*/
  rl.write(file)
  /*
  stdin.on('data', (chunk) => {
    
  })
  */
  return null
}

function init (configName) {
  fs.readdir(process.cwd(), (err, files) => {
    if (err) throw err

    rl.write(`${clearScreen}Creating new ${configName}...\n`)
    let json = { 'dotfiles': [] }

    let filesForEach = () => {
      files.forEach((file) => {
        let obj = configAdder(file)
        if (obj) json.dotfiles.push(obj)
      })
      fs.writeFile(configName, JSON.stringify(json, null, '\t'), (err) => {
        if (err) throw err
        rl.write('Write successful!\n')
        stdin.pause()
      })
    }
    rl.question('Your name is: ', (string) => {
      json.owner = string.trim()
      filesForEach()
    })
  })
}

