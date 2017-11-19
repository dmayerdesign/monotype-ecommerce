const path = require('path');
const fs = require('fs-extra');

const commonSrc = path.resolve(__dirname, '../time-common');
const commonDest = path.resolve(__dirname, '../time-admin/src/common');
const appConfigSrc = path.resolve(__dirname, '../app-config.ts');
const appConfigDest = path.resolve(__dirname, '../time-admin/src/app-config.ts');

try {
    fs.copySync(commonSrc, commonDest);
    fs.copySync(appConfigSrc, appConfigDest);
}
catch (error) {
    console.error(error);
}
