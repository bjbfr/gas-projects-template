#!/bin/bash
# This script is called from the newly created directory for initialization purpose.
# It expects as parameter the name of the artefact (lib or project) being created.
TEMPLATE_DIR="../../../templates"
ln -s ${TEMPLATE_DIR}/tsconfig-gas.json && 
ln -s ${TEMPLATE_DIR}/.claspignore && 
cp ${TEMPLATE_DIR}/tsconfig.json .

if test -f "${TEMPLATE_DIR}/creds.json"; then
    ln -s ${TEMPLATE_DIR}/creds.json 
else
    echo "ERROR: File: creds.json is missing!"
    exit 1
fi

#create directories
mkdir code && mkdir vitests && mkdir code/tests
# code file
cp ${TEMPLATE_DIR}/code/_name_.ts ./code/${1}.ts
sed -i "s/_name_/${1}/g" ./code/${1}.ts
# vitest file 
cp ${TEMPLATE_DIR}/vitests/_name_.test.ts ./vitests/${1}.test.ts
sed -i "s/_name_/${1}/g" ./vitests/${1}.test.ts
# test file
cp ${TEMPLATE_DIR}/code/tests/_name_.test.ts ./code/tests/${1}.test.ts
sed -i "s/_name_/${1}/g" ./code/tests/${1}.test.ts
echo -n "templating done."
exit 0