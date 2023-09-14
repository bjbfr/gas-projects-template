# Directory Structure and Files

## High-level

```
├── dist : root of build directories for projects/libs.
├── docs : documentation.
├── gas-tools : source code for various helping commands defined in package.json ('yarn gas-tools <cmd> args').
├── install.sh : install script.
├── package.json : defines the whole repository as a node project with workspaces enabled; commands are defined here.
├── Readme.md
├── templates : template files for defining libs and projects (used in commands 'yarn init_lib <name>' and 'yarn init_project <name>').
└── vitest.config.ts : configuration file for vitest; plugin for testing GAS code is defined here.
```

## Project/lib

- Gas source code is expected to be placed in directory 'src' with two sub-directories for libs/projects:

```
├── src
    ├── libs : root for all libs.
    └── projects : root for all projects.
```

Those directories are created during install.

- Each library/project contains the following directory/files:

```
├── appsscript.json : manifest file for AppScript
├── .claspignore -> ../../templates/.claspignore : clasp config file that defines which files to push
├── .clasp.json : clasp config file that defines scriptId and rootDir
├── code : directory source code
├── tsconfig-gas.json -> ../../templates/tsconfig-gas.json : ts base config file
└── tsconfig.json : ts config file that extends ts base config file.
```

This is set-up automatically when using init_lib/init_project commands.

References:

- appsscript:
    -  [manifests](https://developers.google.com/apps-script/concepts/manifests) 
    -  [manifest structure](https://developers.google.com/apps-script/manifest)
- clasp :
    - [.clasp.json](https://github.com/google/clasp#project-settings-file-claspjson)
- claspignore
    - [.claspignore](https://github.com/google/clasp#ignore-file-claspignore)