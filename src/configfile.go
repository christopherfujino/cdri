package main

import (
  "fmt"
)

type Dotfile struct {
  Name string
  Target string
  Platform string
}

func (d Dotfile) describe() {
  fmt.Printf("Name: %s\n", d.Name)
  fmt.Printf("Target: %s\n", d.Target)
  fmt.Printf("Platform: %s\n", d.Platform)
}

type ConfigFile struct {
  Owner string
  Dotfiles []Dotfile
}
