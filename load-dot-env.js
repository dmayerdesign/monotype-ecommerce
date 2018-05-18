const fs = require('fs-extra')
const path = require('path')

const envFileBuffer = fs.readFileSync(path.resolve(__dirname, '\.env'))
const arrayOfVariables = envFileBuffer.toString().split('\n')

arrayOfVariables
    .filter((element) => !!element)
    .forEach((element) => {
        const pair = element.split('=')
        const key = pair[0]
        const value = pair[1]
        process.env[key] = value
    })
