# Chris' Dotfile Repository Installer

## First-Time Setup

Create a directory with the configuration files you wish to install.

```bash
$ mkdir dotfiles
$ cd dotfiles
$ cp ~/.bashrc ./
$ cp ~/.vimrc ./
$ cp ~/.npmrc ./
```

*Optional*: initialize it as a git repository.

```bash
$ git init
$ git add .
$ git commit -m 'initial commit'
```

Initialize the repository as an npm package, with a package.json file.

```bash
$ npm init
```

Install the cdri package using `npm`, saving it as a dependency.

```bash
$ npm install --save cdri
```

Run the script.

```bash
$ npm run cdri
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
$ cd dotfiles
$ npm install
$ npm run cdri
```

## To-do

* Check if inventory.json exists
* Verify files in inventory.json exist
