'use strict';

const rl$1 = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var yesOrNo = function (query, cb) {  // yesOrNo()
  rl$1.question(query, (string) => {
    string = string.toLowerCase().trim();
    if (string === 'y' || string === 'yes') {
      cb(true);
    } else if (string === 'n' || string === 'no') {
      cb(false);
    } else {
      rl$1.write('yolo!');
    }
  });
};

const fs$1 = require('fs');
const clearScreen$1 = '\u001b[2J\u001b[0;0H';
var initValidator = function (configName) {  // create a new repository
  fs$1.readFile(configName, 'utf8', (err) => {
    if (err) {
      stdin.removeAllListeners('data');
      init(configName);
    } else {
      rl$1.write(clearScreen$1);
      yesOrNo(`${configName} file already exists! Would you like to\
overwrite (y/n)? `, (bool) => {
        if (bool) {
          fs$1.unlink(configName, (err) => {
            if (err) throw err
            rl$1.write('blah');
          });
        } else {
          rl$1.write('To run cdri using existing config.json, simply run the command in this directory');
          process.exit(0);
        }
      });
    }
  });
};

function configAdder (file) {  // check if we want to add to configName,
                              // add if so
/*
  process.stdout.write('Would you like to add file ' + file +
      ' to config (y/n)? ')
*/
  rl$1.write(file);
  /*
  stdin.on('data', (chunk) => {
    
  })
  */
  return null
}

function init (configName) {
  fs$1.readdir(process.cwd(), (err, files) => {
    if (err) throw err

    rl$1.write(`${clearScreen$1}Creating new ${configName}...`);
    let json = { 'dotfiles': [] };

    let filesForEach = () => {
      files.forEach((file) => {
        let obj = configAdder(file);
        if (obj) json.dotfiles.push(obj);
      });
      fs$1.writeFile(configName, JSON.stringify(json, null, '\t'), (err) => {
        if (err) throw err
        rl$1.write('Write successful!');
        stdin.pause();
      });
    };
    rl$1.question('Your name is: ', (string) => {
      json.owner = string.trim();
      filesForEach();
    });
  });
}

const path$1 = require('path');

function tildeExpansion (input) {
  let parsed = input.replace(/~/, process.env.HOME);
  return path$1.normalize(parsed) // to transform . or ..
}

const configName = 'config.json';
const fs = require('fs');
const path = require('path');
const rl = require('./modules/rl');

let config = {};
let working = {
  dotfiles: []
};
const platform = require('os').platform();
const clearScreen = '\u001b[2J\u001b[0;0H';

exports.app = () => {
  if (process.argv.length > 2) {  // init new config.json
    const opt = process.argv[2];
    if (opt === 'init') {
      initValidator(configName); // from './modules/initValidator.js'
    } else {
      rl.write(`Unknown parameter "${opt}"!`);
      process.exit(0);
    }
  } else {  // install
    try {
      var data = fs.readFileSync(configName, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') {
        yesOrNo(rl, 'Config file not found. Would you like to create one? ',
          (bool) => {
          if (bool) {
            rl.write('You said yes!');
          } else {
            rl.write('You said no!');
          }
        });
        return
      } else {
        throw err
      }
    }
    configLoader(data);
  }
};

function configLoader (data) {
  config = JSON.parse(data);
  configValidator(config, menu);
}

function configValidator (config, successCallback) {
  if (!config.dotfiles || !Array.isArray(config.dotfiles) ||
      config.dotfiles.length < 1) {
    console.log('No dotfiles found in config.');
    return
  }
  fs.readdir(process.cwd(), function (err, files) {
    if (err) throw err
    config.dotfiles.forEach(function (dotfile) {
      dotfileValidator(dotfile, files);
    });
    successCallback();
  });  // reads the contents of a directory
}

function dotfileValidator (dotfile, files) {
  if (files.indexOf(dotfile.name) !== -1) { // if file exists
    if (dotfile.platform === undefined || dotfile.platform === 'any' ||
        dotfile.platform === platform) {
      dotfile.target = tildeExpansion(dotfile.target);
      working.dotfiles.push(dotfile);
    } else {
      console.log(`Error: File "${dotfile.name}" is for the platform` +
          dotfile.platform);
    }
  } else {
    console.log(`Error: File "${dotfile.name}" not found!`);
  }
}

function removeTrailingSeparator (filepath) {
  const last = filepath.length - 1;
  if (filepath[last] === path.sep) {
    filepath = filepath.slice(0, -1);
  }
  return filepath
}

function removeLevel (filepath) {
  filepath = removeTrailingSeparator(filepath);
  const arr = filepath.split(path.sep);
  const last = arr.length - 1;
  filepath = filepath.slice(0, -arr[last].length);
  return removeTrailingSeparator(filepath)
}

function install () {
  console.log(`${clearScreen}Now installing...`);
  working.dotfiles.forEach(function (dotfile) {
    const target = dotfile.target;
    const name = dotfile.name;
    const checked = dotfile.checked;

    if (!checked) {
      return
    }
    try {
      fs.statSync(target); // synchronously, since we are
                                      // in a forEach loop
      console.log(`File "${target} already exists!"`);
    } catch (err) { // safe to install
      try {
        fs.symlinkSync(`${process.cwd()}/${name}`, target);
      } catch (err) { // target directory doesn't exist
        mkdir(removeLevel(target));  // strip filename first
        try {
          fs.symlinkSync(`${process.cwd()}/${name}`, target);
        } catch (err) {
          rl.write('Huh?!');
          console.error(err);
          process.exit(0);
        }
      }
      rl.write(`${name} successfully linked!`);
    }
    //  tryInstall(dotfile.target, dotfile.name)
  });
  process.exit(0);
}

let mkdirCounter = 20;
function mkdir (target) {  // recursive function
  if (mkdirCounter-- < 1) {
    console.error('Recursive error in mkdir!');
    process.exit(0);
  }
  try {
    fs.mkdirSync(target);
    return 1
  } catch (err) {
    let splitArray = target.split(path.sep);
    let last = splitArray.length - 1;
    if (splitArray[last] === '') { // dump trailing '/'
      splitArray.pop(last);
      last = splitArray.length - 1;
      target = target.slice(0, -1);
    }
    const newTarget = target.slice(0, -(splitArray[last].length));
    mkdir(newTarget);
    mkdir(target);
  }
}

function drawMenu () {
  rl.write(clearScreen);
  rl.write(`${config.owner}\'s Dotfiles`);
  working.dotfiles.forEach(function (dotfile, i) {
    if (dotfile.platform === undefined || dotfile.platform === 'any' ||
        dotfile.platform === platform) {
      let check = ' ';
      if (dotfile.checked) { check = 'x'; }
      rl.write(`${i}) ${dotfile.name} [${check}]`);
    }
  });
}

function menu () {
  drawMenu();
  rl.question('Type number to select/unselect dotfile, \
[q] to quit, [i] to install: ', (string) => {
    if (string.trim()[0] === 'q') {
      rl.write('Exiting without installing dotfiles.');
      process.exit(0);
    } else if (string.trim()[0] === 'i') {
      install();
      return
    } else {  // should be a number
      let num = Number(string);
      if (!isNaN(num) && num === Math.floor(num) &&
          num <= working.dotfiles.length - 1) {
        working.dotfiles[num].checked = !working.dotfiles[num].checked;
      }
      menu();
    }
  });
}
