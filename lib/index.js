'use strict';

exports.app = function () {
  var fs = require('fs');
  var config = {};
  var working = {
    dotfiles: []
  };
  var exec = require('child_process').exec;
  var platform = require('os').platform();
  var stdin = void 0; // make global

  var clearScreen = '\u001b[2J\u001b[0;0H';

  fs.readFile('config.json', 'utf8', configLoader);

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
          // if this file is in the directory
          if (dotfile.platform === undefined || dotfile.platform === 'any' || dotfile.platform === platform) {
            dotfile.target = tildeExpansion(dotfile.target);
            working.dotfiles.push(dotfile);
          } else {
            console.log('Error: File "' + dotfile.name + '" is for the platform "' + dotfile.platform + '"');
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
        console.log(i + '. ' + dotfile.name + ' [' + check + ']');
      }
    });
    console.log('\nType number to select/unselect dotfile, [q] to quit, [i] to install:');
  }

  function install() {
    console.log(clearScreen + 'Now installing...');
    working.dotfiles.forEach(installVerify);
    process.exit(0);
  }

  function installVerify(dotfile) {
    if (!dotfile.checked) return;
    try {
      var stats = fs.statSync(dotfile.target); // synchronously, since we need to read consecutively
      console.log('File "' + dotfile.target + ' already exists!"');
    } catch (err) {
      // safe to install 
      fs.symlinkSync(process.cwd() + '/' + dotfile.name, dotfile.target);
      console.log(dotfile.name + ' successfully linked!');
    }
    /*
        fs.stat(dotfile.target, function (err, stats) {
          if (err) {
            // safe to install 
            fs.symlink(`${process.cwd()}/${dotfile.name}`, dotfile.target, function () {
              console.log(`${dotfile.name} successfully linked!`)
            })
          }
          else if (stats.isFile()) {
            console.log(`File "${dotfile.target} already exists!"`)
          } else {
          // huh?
          }
        })
        */
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
