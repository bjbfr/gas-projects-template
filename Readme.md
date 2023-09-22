# Introduction

This is a starter project for Google App Script (GAS) projects.

# Install

In your target directory, you excute install script using either
-   curl or
  ```
  curl https://raw.githubusercontent.com/bjbfr/gas-projects-template/main/install.sh | bash -s
  ```
- wget:
  ```
  wget -O - https://raw.githubusercontent.com/bjbfr/gas-projects-template/main/install.sh | bash -s
  ```

2. Install clasp: 
  see detailed [instructions](./docs/clasp.md) (manual steps are required) 

3. Optionally, add a "drive" entry in the cloud.json file:
```
{
    "drive":{ 
      // id of Drive folder in which lib script should be stored
      "libFolder":<folder id>
    }
}
```

# Commands

- ```yarn init_project <name>```: initialize a project (ask for creating/cloning gas project)
- ```yarn init_lib <name>```: initialize a lib  (ask for creating/cloning gas project)
- ```yarn init_clasp```: initialize clasp-related files for the current artefact
- ```yarn update_clasp```: update clasp-related files for the current artefact
- ```yarn tsc:build```: transpile the current artefact
- ```yarn copy_deps```: copy dependencies and meta-file (appscript.json) for the current artefact
- ```yarn build```: do tsc:build plus copy_deps
- ```yarn build_all```: build all artefacts located in sub-directories (shall be executes from src/libs or src/projects)
- ```yarn tsc:clean```: remove transpiled files for the current artefact (but no dependencies)
- ```yarn clean```: remove all build files for the current artefact (transpiles files and dependencies)
- ```yarn clean_all```: clean all artefacts located in sub-directories (shall be executes from src/libs or src/projects)
- ```yarn clean_build```: do clean plus build
- ```yarn test:vitest```: test the current artefact with vitest (local tests)
- ```yarn login```: logs clasp with gcp credentials
- ```yarn push```: build the current artefact and push it to Google Drive
- ```yarn test:gas```: push the current artefactt and launch clasp run