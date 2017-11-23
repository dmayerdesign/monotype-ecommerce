const path = require('path')
const fs = require('fs-extra')

const typegooseSrc = path.resolve(__dirname, './patches/typegoose/typegoose.js')
const typegooseDest = path.resolve(__dirname, '../node_modules/typegoose/lib/typegoose.js')

try {
    fs.copySync(typegooseSrc, typegooseDest)
    if (fs.existsSync(typegooseDest + '.map')) {
        fs.unlinkSync(typegooseDest + '.map')
    }
    process.exit()
}
catch (error) {
    console.error(error);
    process.exit(1)
}
