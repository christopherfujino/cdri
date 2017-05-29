'use strict';

var configName = 'config.json';
var async = require('async');
var fs = require('fs');
var path = require('path');

var config = {};
var working = {
  dotfiles: []
};
var platform = require('os').platform();
var stdin = process.stdin;
stdin.resume();
var clearScreen = '\x1B[2J\x1B[0;0H';

exports.app = function () {
  if (process.argv.length > 2) {
    var opt = process.argv[2];
    if (opt === 'init') {
      initValidator();
    } else {
      console.log('Unknown parameter "' + opt + '"!');
      process.exit(0);
    }
  } else {
    fs.readFile(configName, 'utf8', configLoader);
  }
};

function init() {
  fs.readdir(process.cwd(), function (err, files) {
    if (err) throw err;

    console.log(clearScreen + 'Creating new ' + configName + '...');
    var json = { 'dotfiles': [] };

    var filesForEach = function filesForEach() {
      files.forEach(function (file) {
        var obj = configAdder(file);
        if (obj) json.dotfiles.push(obj);
      });
      fs.writeFile(configName, JSON.stringify(json, null, '\t'), function (err) {
        if (err) throw err;
        console.log('Write successful!');
        stdin.pause();
      });
    };
    process.stdout.write('Your name is: ');
    stdin.on('data', function (chunk) {
      stdin.removeAllListeners();
      json.owner = chunkToString(chunk);
      filesForEach();
    });
  });
}

function initValidator() {
  // create a new repository
  fs.readFile(configName, 'utf8', function (err) {
    if (err) {
      stdin.removeAllListeners('data');
      init();
    } else {
      process.stdout.write(clearScreen + configName + ' file already exists!\nWould you like to overwrite (y/n)? ');
      stdin.on('data', function (chunk) {
        chunk = chunkToString(chunk).toLowerCase();
        if (chunk === 'y' || chunk === 'yes') {
          stdin.removeAllListeners('data');
          fs.unlink(configName, function (err) {
            if (err) throw err;
            init();
          });
        } else if (chunk === 'n' || chunk === 'no') {
          console.log('To run cdri using existing config.json, simply run the command in this directory');
          process.exit(0);
        } else {
          console.log(chunk);
        }
      });
    }
  });
}

function chunkToString(chunk) {
  var string = '' + chunk;
  return string.split('\n')[0];
}

function configAdder(file) {
  // check if we want to add to configName,
  // add if so
  /*
    process.stdout.write('Would you like to add file ' + file +
        ' to config (y/n)? ')
  */
  console.log(file);
  /*
  stdin.on('data', (chunk) => {
    
  })
  */
  return null;
}

function configLoader(err, data) {
  if (err) throw err;
  config = JSON.parse(data);
  configValidator(config, menu);
}

function tildeExpansion(input) {
  return input.replace(/~/, process.env.HOME);
}

function configValidator(config, successCallback) {
  if (!config.dotfiles || !Array.isArray(config.dotfiles) || config.dotfiles.length < 1) {
    console.log('No dotfiles found in config.');
    return;
  }
  fs.readdir(process.cwd(), function (err, files) {
    if (err) throw err;
    config.dotfiles.forEach(function (dotfile) {
      dotfileValidator(dotfile, files);
    });
    successCallback();
  }); // reads the contents of a directory
}

function dotfileValidator(dotfile, files) {
  if (files.indexOf(dotfile.name) !== -1) {
    // if file exists
    if (dotfile.platform === undefined || dotfile.platform === 'any' || dotfile.platform === platform) {
      dotfile.target = tildeExpansion(dotfile.target);
      working.dotfiles.push(dotfile);
    } else {
      console.log('Error: File "' + dotfile.name + '" is for the platform' + dotfile.platform);
    }
  } else {
    console.log('Error: File "' + dotfile.name + '" not found!');
  }
}

function splash(string) {
  var topBottom = '';
  for (var i = 0; i < string.length + 4; i++) {
    topBottom += '*';
  }
  return topBottom + '\n* ' + string + ' *\n' + topBottom + '\n';
}

function drawMenu() {
  console.log(clearScreen);
  console.log(splash('Installing ' + config.owner + '\'s Dotfiles'));
  working.dotfiles.forEach(function (dotfile, i) {
    if (dotfile.platform === undefined || dotfile.platform === 'any' || dotfile.platform === platform) {
      var check = ' ';
      if (dotfile.checked) {
        check = 'x';
      }
      console.log(i + ') ' + dotfile.name + ' [' + check + ']');
    }
  });
  process.stdout.write('\nType number to select/unselect dotfile, ' + '[q] to quit, [i] to install: ');
}

function removeTrailingSeparator(filepath) {
  var last = filepath.length - 1;
  if (filepath[last] === path.sep) {
    filepath = filepath.slice(0, -1);
  }
  return filepath;
}

function removeLevel(filepath) {
  filepath = removeTrailingSeparator(filepath);
  var arr = filepath.split(path.sep);
  var last = arr.length - 1;
  filepath = filepath.slice(0, -arr[last].length);
  return removeTrailingSeparator(filepath);
}

function install() {
  console.log(clearScreen + 'Now installing...');
  working.dotfiles.forEach(function (dotfile) {
    var target = dotfile.target;
    var name = dotfile.name;
    var checked = dotfile.checked;

    if (!checked) {
      return;
    }
    try {
      fs.statSync(target); // synchronously, since we are
      // in a forEach loop
      console.log('File "' + target + ' already exists!"');
    } catch (err) {
      // safe to install
      try {
        fs.symlinkSync(process.cwd() + '/' + name, target);
      } catch (err) {
        // target directory doesn't exist
        mkdir(removeLevel(target)); // strip filename first
        try {
          fs.symlinkSync(process.cwd() + '/' + name, target);
        } catch (err) {
          console.log('Huh?!');
          console.error(err);
          process.exit(0);
        }
      }
      console.log(name + ' successfully linked!');
    }
    //  tryInstall(dotfile.target, dotfile.name)
  });
  process.exit(0);
}

var mkdirCounter = 20;
function mkdir(target) {
  // recursive function
  if (mkdirCounter-- < 1) {
    console.error('Recursive error in mkdir!');
    process.exit(0);
  }
  try {
    fs.mkdirSync(target);
    return 1;
  } catch (err) {
    var splitArray = target.split(path.sep);
    var last = splitArray.length - 1;
    if (splitArray[last] === '') {
      // dump trailing '/'
      splitArray.pop(last);
      last = splitArray.length - 1;
      target = target.slice(0, -1);
    }
    var newTarget = target.slice(0, -splitArray[last].length);
    mkdir(newTarget);
    mkdir(target);
  }
}

function menu() {
  drawMenu();
  stdin.on('data', function (chunk) {
    if (('' + chunk)[0] === 'q') {
      console.log('Exiting without installing dotfiles.');
      process.exit(0);
    }
    if (('' + chunk)[0] === 'i') {
      console.log('install!');
      stdin.removeAllListeners('data');
      install();
      //  .on('data', install)
      return;
    }
    chunk = +chunk;
    if (!isNaN(chunk) && chunk < working.dotfiles.length) {
      working.dotfiles[chunk].checked = !working.dotfiles[chunk].checked;
    }
    drawMenu();
  });
}