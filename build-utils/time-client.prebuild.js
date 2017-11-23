const path = require('path')
const fs = require('fs-extra')

const commonSrc = path.resolve(__dirname, '../time-common')
const commonDest = path.resolve(__dirname, '../time-client/src/common')
const appConfigSrc = path.resolve(__dirname, '../app-config.ts')
const appConfigDest = path.resolve(__dirname, '../time-client/src/app-config.ts')

try {
    fs.copySync(commonSrc, commonDest)
    fs.copySync(appConfigSrc, appConfigDest)
    process.exit()
}
catch (error) {
    console.error(error)
    process.exit(1)
}
