# Command-line Dotfile Repository Installer

Command-line tool to symlink selected config files from a local repository to the target location on the filesystem.

## First-Time Setup

Create a directory with the configuration files you wish to install.

```bash
$ mkdir dotfiles
$ cd dotfiles
$ mv ~/.bashrc ./
$ mv ~/.vimrc ./
$ mv ~/.npmrc ./
```

*Optional*: initialize it as a git repository.

```bash
$ git init
$ git add .
$ git commit -m 'initial commit'
```

Install the cdri package using `npm` globally.

```bash
$ npm install -g cdri
```

Create a `config.json` file in the repository describing the configuration files you will be tracking. Here is an example:

```json
{
  "owner": "Christopher Fujino",
  "dotfiles" : [
    {
      "name" : ".bashrc.linux",
      "target" : "~/.bashrc",
      "platform" : "linux"
    },
    {
      "name" : ".bashrc.osx",
      "target" : "~/.bashrc",
      "platform" : "darwin"
    },
    {
      "name" : ".vimrc",
      "target" : "~/.vimrc"
    }
  ]
}
```

The "dotfiles" property is an array of objects, each object describing a configuration file. In these objects, the "name" property is the filename in the repository, the "target" property is the filepath and filename of the symlink to be installed. Paths should be absolute, though tildes are allowed. The "platform" property, if included, should be either "linux", "darwin", "win32", or "any". The default is "any".

You can also copy the example config file with `cp node_modules/cdri/config.json.example ./config.json` and then editing the fields to fit your needs.

Run the script in the dotfiles repo.

```bash
$ cdri
```

*Optional*: if you're using git, create a `.gitignore` file including the directory `node_modules`. Commit the rest of the repository.

```bash
$ echo "node_modules" > .gitignore
$ git add .
$ git commit
```

## Subsequent Installation

After you've completed the initial setup, you can now reproduce your setup on additional systems by cloning your dotfiles repo.

```bash
$ git clone https://github.com/username/dotfiles.git
$ npm install -g cdri
$ cd dotfiles
$ cdri
```
