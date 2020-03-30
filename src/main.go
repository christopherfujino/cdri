package main

import (
  "encoding/json"
	"flag"
	"fmt"
  "io/ioutil"
	"os"
)

// Print out usage for the tool
func usage() {
	fmt.Println("You used this tool wrong!")
	flag.PrintDefaults()
}

func parseConfig(configPath string) ConfigFile {
  data, fileErr := ioutil.ReadFile(configPath)
  if fileErr != nil {
    fmt.Println(fileErr)
    os.Exit(1)
  }
  var configFile ConfigFile
  parseError := json.Unmarshal(data, &configFile)
  if (parseError != nil) {
    fmt.Println(parseError)
    os.Exit(1)
  }
  return configFile
}

func main() {
  // Path to the config file to read
	configPath := flag.String("config", "", "Path to config JSON file.")
	flag.Parse()
	if *configPath == "" {
		usage()
		os.Exit(1)
	}

  config := parseConfig(*configPath)
  fmt.Printf("Hello, %s!\n", config.Owner)

  for i := 0; i < len(config.Dotfiles); i++ {
    config.Dotfiles[i].describe()
  }
}
