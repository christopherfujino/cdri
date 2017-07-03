'use strict';

var rl = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var yesOrNo = function yesOrNo(query, cb) {
  // yesOrNo()
  rl.question(query, function (string) {
    string = string.toLowerCase().trim();
    if (string === 'y' || string === 'yes') {
      cb(true);
    } else if (string === 'n' || string === 'no') {
      cb(false);
    } else {
      rl.write('yolo!');
    }
  });
};

var fs$1 = require('fs');
var clearScreen$1 = '\x1B[2J\x1B[0;0H';
var initValidator = function initValidator(configName) {
  // create a new repository
  fs$1.readFile(configName, 'utf8', function (err) {
    if (err) {
      stdin.removeAllListeners('data');
      init(configName);
    } else {
      rl.write(clearScreen$1);
      yesOrNo(configName + ' file already exists! Would you like tooverwrite (y/n)? ', function (bool) {
        if (bool) {
          fs$1.unlink(configName, function (err) {
            if (err) throw err;
            rl.write('blah');
          });
        } else {
          rl.write('To run cdri using existing config.json, simply run the command in this directory\n');
          process.exit(0);
        }
      });
    }
  });
};

function configAdder(file) {
  // check if we want to add to configName,
  // add if so
  /*
    process.stdout.write('Would you like to add file ' + file +
        ' to config (y/n)? ')
  */
  rl.write(file);
  /*
  stdin.on('data', (chunk) => {
    
  })
  */
  return null;
}

function init(configName) {
  fs$1.readdir(process.cwd(), function (err, files) {
    if (err) throw err;

    rl.write(clearScreen$1 + 'Creating new ' + configName + '...\n');
    var json = { 'dotfiles': [] };

    var filesForEach = function filesForEach() {
      files.forEach(function (file) {
        var obj = configAdder(file);
        if (obj) json.dotfiles.push(obj);
      });
      fs$1.writeFile(configName, JSON.stringify(json, null, '\t'), function (err) {
        if (err) throw err;
        rl.write('Write successful!\n');
        stdin.pause();
      });
    };
    rl.question('Your name is: ', function (string) {
      json.owner = string.trim();
      filesForEach();
    });
  });
}

var path$1 = require('path');

function tildeExpansion(input) {
  var parsed = input.replace(/~/, process.env.HOME);
  parsed.replace(/^\.\//, process.cwd() + '/');
  // .. not parsed
  return parsed;
}

var configName = 'config.json';
var fs = require('fs');
var path = require('path');

var config = {};
var working = {
  dotfiles: []
};
var platform = require('os').platform();
var clearScreen = '\x1B[2J\x1B[0;0H';

exports.app = function () {
  if (process.argv.length > 2) {
    // init new config.json
    var opt = process.argv[2];
    if (opt === 'init') {
      initValidator(configName); // from './modules/initValidator.js'
    } else {
      rl.write('Unknown parameter "' + opt + '"!\n');
      process.exit(0);
    }
  } else {
    // install
    try {
      var data = fs.readFileSync(configName, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') {
        yesOrNo('Config file not found. Would you like to create one? ', function (bool) {
          if (bool) {
            rl.write('You said yes!\n');
          } else {
            rl.write('You said no!\n');
          }
        });
        return;
      } else {
        throw err;
      }
    }
    configLoader(data);
  }
};

function configLoader(data) {
  config = JSON.parse(data);
  configValidator(config, menu);
}

function configValidator(config, successCallback) {
  if (!config.dotfiles || !Array.isArray(config.dotfiles) || config.dotfiles.length < 1) {
    rl.write('No dotfiles found in config.\n');
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
      rl.write('Error: File "' + dotfile.name + '" is for the platform ' + dotfile.platform + '\n');
    }
  } else {
    rl.write('Error: File "' + dotfile.name + '" not found!\n');
  }
}

function splash(string) {
  var topBottom = '';
  for (var i = 0; i < string.length + 4; i++) {
    topBottom += '*';
  }
  return topBottom + '\n* ' + string + ' *\n' + topBottom + '\n';
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
      rl.write('Checking if ' + target + ' exists\n');
      fs.statSync(target); // synchronously, since we are
      // in a forEach loop
      rl.write('File "' + target + ' already exists!"\n');
    } catch (err) {
      // safe to install
      try {
        rl.write(target + ' does not exist, trying to create it now\n');
        fs.symlinkSync(process.cwd() + '/' + name, target);
      } catch (err) {
        // target directory doesn't exist
        mkdir(removeLevel(target)); // strip filename first
        try {
          fs.symlinkSync(process.cwd() + '/' + name, target);
        } catch (err) {
          rl.write('Huh?!\n');
          console.error(err);
          process.exit(1);
        }
      }
      rl.write(name + ' successfully linked!\n');
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
    rl.write('trying to make ' + target + '\n');
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

function drawMenu() {
  rl.write(clearScreen + splash('Installing ' + config.owner + '\'s Dotfiles') + '\n');
  working.dotfiles.forEach(function (dotfile, i) {
    if (dotfile.platform === undefined || dotfile.platform === 'any' || dotfile.platform === platform) {
      var check = ' ';
      if (dotfile.checked) {
        check = 'x';
      }
      rl.write(i + ') ' + dotfile.name + ' [' + check + ']\n');
    }
  });
  rl.write('\n');
}

function menu() {
  drawMenu();
  rl.question('Type number to select/unselect dotfile, \
[q] to quit, [i] to install: ', function (string) {
    if (string.trim()[0] === 'q') {
      rl.write('Exiting without installing dotfiles.\n');
      process.exit(0);
    } else if (string.trim()[0] === 'i') {
      install();
      return;
    } else {
      // should be a number
      var num = Number(string);
      if (!isNaN(num) && num === Math.floor(num) && num <= working.dotfiles.length - 1) {
        working.dotfiles[num].checked = !working.dotfiles[num].checked;
      }
      menu();
    }
  });
}