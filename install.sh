REPO="https://github.com/bjbfr/gas-projects-template.git"
mkdir dist && mkdir src && mkdir src/libs && mkdir src/projects
git clone "$REPO" . &&
yarn install &&
cd gas-tools && mkdir logs &&
yarn install &&
yarn build &&
yarn link &&
cd .. &&
yarn link gas-tools
