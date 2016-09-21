'use strict';

exports.app = function () {
  var fs = require('fs');
  var path = require('path');
  var config = {};
  var working = {
    dotfiles: []
  };
  var platform = require('os').platform();
  var stdin = void 0; // make global

  var clearScreen = '\u001b[2J\u001b[0;0H';

  if (process.argv.length > 2) {
    var opt = process.argv[2];
    if (opt === 'init') init();
  } else {
    fs.readFile('config.json', 'utf8', configLoader);
  }

  function init() {// create a new repository

  }

  function configLoader(err, data) {
    if (err) throw err;
    config = JSON.parse(data);
    stdin = process.openStdin();
    configValidator(config, function () {
      menu();
    });
  }

  function tildeExpansion(input) {
    return input.replace(/~/, process.env.HOME);
  }

  function configValidator(config, successCallback) {
    var isSuccessful = true;
    if (!config.dotfiles || !Array.isArray(config.dotfiles) || config.dotfiles.length < 1) {
      console.log('No dotfiles found in config.');
      return;
    }
    fs.readdir(process.cwd(), function (err, files) {
      config.dotfiles.forEach(function (dotfile) {
        if (files.indexOf(dotfile.name) != -1) {
          // if file exists
          if (dotfile.platform === undefined || dotfile.platform === 'any' || dotfile.platform === platform) {
            dotfile.target = tildeExpansion(dotfile.target);
            working.dotfiles.push(dotfile);
          } else {
            console.log('Error: File "' + dotfile.name + '" is for the platform' + dotfile.platform);
          }
        } else {
          console.log('Error: File "' + dotfile.name + '" not found!');
          isSuccessful = false;
        }
      });
      if (isSuccessful) successCallback();
    }); // reads the contents of a directory
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
    console.log('\nType number to select/unselect dotfile, ' + '[q] to quit, [i] to install:');
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
      tryInstall(dotfile.target, dotfile.name);
    });
    process.exit(0);
  }

  var mkdirCounter = 20;
  function mkdir(target) {
    if (mkdirCounter-- === 0) {
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

  function tryInstall(target, name) {}

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
        //.on('data', install)
        return;
      }
      chunk = +chunk;
      if (!isNaN(chunk) && chunk < working.dotfiles.length) {
        working.dotfiles[chunk].checked = !working.dotfiles[chunk].checked;
      }
      drawMenu();
    });
  }
};
