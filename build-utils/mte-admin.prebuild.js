const path = require('path')
const fs = require('fs-extra')

const commonSrc = path.resolve(__dirname, '../mte-common')
const commonDest = path.resolve(__dirname, '../mte-admin/src/common')
const appConfigSrc = path.resolve(__dirname, '../app-config.ts')
const appConfigDest = path.resolve(__dirname, '../mte-admin/src/app-config.ts')

console.log('Copying common files...')

try {
    fs.copySync(commonSrc, commonDest)
    fs.copySync(appConfigSrc, appConfigDest)
    console.log('Copied common files!')
    process.exit()
}
catch (error) {
    console.error(error)
    process.exit(1)
}
