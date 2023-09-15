REPO="https://github.com/bjbfr/gas-projects-template.git"
# clone repo and create directories
git clone "$REPO" . &&
mkdir dist && mkdir src && mkdir src/libs && mkdir src/projects
# install npm packages
yarn install
# build and link gas-tools
cd gas-tools && mkdir logs &&
yarn install &&
yarn build &&
yarn link &&
cd .. &&
yarn link gas-tools
