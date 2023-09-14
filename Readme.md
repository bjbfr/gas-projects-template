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

3. Optionally, define a cloud.json file:

with the following structure:

```
{
    "gcp": {
      //Google Cloud Project Id
      "projectId":<id>,
      //Google Cloud Project Number
      "projectNumber":<number>
    },
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

- test (remotely): ```clasp run```

