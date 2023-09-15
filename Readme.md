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

- initialize a lib: ```yarn init_lib <name>```

- initialize a project: ```yarn init_project <name>```

- transpile: ```yarn tsc:build```

- test (locally): ```yarn test:vitest```

- push to Google Drive: ```yarn push```

- login locally: ```clasp login --creds ./creds.json```

- test (remotely): ```clasp run```

