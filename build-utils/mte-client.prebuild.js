// const path = require('path')
// const fs = require('fs-extra')
// const rimraf = require('rimraf')

// const commonSrc = path.resolve(__dirname, '../mte-common')
// const commonDest = path.resolve(__dirname, '../mte-client/src/mte_modules/common')
// const appConfigSrc = path.resolve(__dirname, '../app-config.ts')
// const appConfigDest = path.resolve(__dirname, '../mte-client/src/mte_modules/app-config.ts')

// console.log('Copying common files...')

// // Copy files from mte-common to mte-client/src/mte_modules/common.

// try {
//     if (!fs.existsSync(path.resolve(__dirname, '../mte-client/src/mte_modules'))){
//         fs.mkdirpSync(path.resolve(__dirname, '../mte-client/src/mte_modules'));
//     }
//     rimraf.sync(commonDest)
//     fs.copySync(commonSrc, commonDest)
//     fs.copySync(appConfigSrc, appConfigDest)
//     rimraf.sync(path.resolve(commonDest, 'types'))
//     rimraf.sync(path.resolve(commonDest, 'work-files'))
//     console.log('Copied common files!')
//     process.exit()
// }
// catch (error) {
//     console.error(error)
//     process.exit(1)
// }