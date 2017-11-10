const path = require('path');
const fs = require('fs-extra');

const commonSrc = path.resolve(__dirname, '../../time-common');
const commonDest = path.resolve(__dirname, '../src/client/app/common');
const appConfigSrc = path.resolve(__dirname, '../../app-config.ts');
const appConfigDest = path.resolve(__dirname, '../src/client/app/app-config.ts');

try {
    fs.copySync(commonSrc, commonDest);
    fs.copySync(appConfigSrc, appConfigDest);
}
catch (error) {
    console.error(error);
}
