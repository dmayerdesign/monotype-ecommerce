const path = require('path')
const fs = require('fs-extra')

const typegoosePatches = [
    'prop.js',
    'typegoose.js',
    'utils.js',
];

console.log('Monkey-patching Typegoose\n')

const typegooseSrc = path.resolve(__dirname, './patches/typegoose')
const typegooseDest = path.resolve(__dirname, '../node_modules/typegoose/lib')

try {
    typegoosePatches.forEach((patchFileName, index) => {
        fs.copySync(`${typegooseSrc}/${patchFileName}`, `${typegooseDest}/${patchFileName}`)
        if (fs.existsSync(`${typegooseDest}/${patchFileName}` + '.map')) {
            fs.unlinkSync(`${typegooseDest}/${patchFileName}` + '.map')
        }
        if (index === 0) {
            console.log('Patched')
        }
        
        console.log('    • ' + patchFileName)

        if (index === typegoosePatches.length - 1) {
            console.log('\nMonkey-patch succeeded!\n')
        }
    })
    process.exit()
}
catch (error) {
    console.error(error);
    errors.push(patchFileName)
    process.exit(1)
}
