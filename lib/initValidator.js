const fs = require('fs')
const clearScreen = '\u001b[2J\u001b[0;0H'

function chunkToString (chunk) {
  let string = '' + chunk
  return string.split('\n')[0]
}

export default function (configName) {  // create a new repository
  fs.readFile(configName, 'utf8', (err) => {
    if (err) {
      stdin.removeAllListeners('data')
      init(configName)
    } else {
      process.stdout.write(clearScreen + configName +
          ' file already exists!\nWould you like to overwrite (y/n)? ')
      stdin.on('data', function (chunk) {
        chunk = chunkToString(chunk).toLowerCase()
        if (chunk === 'y' || chunk === 'yes') {
          stdin.removeAllListeners('data')
          fs.unlink(configName, (err) => {
            if (err) throw err
            (configName)
          })
        } else if (chunk === 'n' || chunk === 'no') {
          console.log('To run cdri using existing config.json, simply run the command in this directory')
          process.exit(0)
        } else { console.log(chunk) }
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
  console.log(file)
  /*
  stdin.on('data', (chunk) => {
    
  })
  */
  return null
}

function init (configName) {
  fs.readdir(process.cwd(), (err, files) => {
    if (err) throw err

    console.log(clearScreen + 'Creating new ' + configName + '...')
    let json = { 'dotfiles': [] }

    let filesForEach = () => {
      files.forEach((file) => {
        let obj = configAdder(file)
        if (obj) json.dotfiles.push(obj)
      })
      fs.writeFile(configName, JSON.stringify(json, null, '\t'), (err) => {
        if (err) throw err
        console.log('Write successful!')
        stdin.pause()
      })
    }
    process.stdout.write('Your name is: ')
    stdin.on('data', (chunk) => {
      stdin.removeAllListeners()
      json.owner = chunkToString(chunk)
      filesForEach()
    })
  })
}

