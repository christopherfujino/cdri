'use strict';

exports.app = function () {
  var fs = require('fs');
  var config = {};
  var exec = require('child_process').exec;
  var platform = require('os').platform;

  var clearScreen = '\u001b[2J\u001b[0;0H';

  fs.readFile('config.json', 'utf8', configLoader);

  function configLoader(err, data) {
    if (err) throw err;
    config = JSON.parse(data);
    menu();
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
    config.dotfiles.forEach(function (dotfile, i) {
      if (dotfile.platform === 'any' || dotfile.platform === platform()) {
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
    console.log(clearScreen);
    console.log('Will now install:');
    config.dotfiles.forEach(function (dotfile) {
      if (dotfile.checked) console.log(dotfile.name);
    });
    process.exit(0);
  }

  function menu() {
    drawMenu();
    var stdin = process.openStdin();
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
      if (isNaN(chunk) || chunk >= config.dotfiles.length) return;
      config.dotfiles[chunk].checked = !config.dotfiles[chunk].checked;
      drawMenu();
    });
  }
};
