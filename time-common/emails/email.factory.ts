import { injectable } from 'inversify'

const receipt = require('./templates/receipt')
const shippingNotification = require('./templates/shippingNotification')
const emailVerification = require('./templates/emailVerification')

const defaultOptions = {
    mastheadBgColor: "#00b0ff",
    accentColor: "#ff3c7c",
    fontFamily: "Montserrat",
    innerBgColor: "#fdfdfd",
}

@injectable()
export class EmailFactory {
    constructor() {}

    createEmailVerification(o) {
        const options = Object.assign({}, defaultOptions, o)
        return emailVerification(options)
    }

    createReceipt(o) {
        const options = Object.assign({}, defaultOptions, o)
        return receipt(options)
    }

    createShippingNotification(o) {
        const options = Object.assign({}, defaultOptions, o)
        return shippingNotification(options)
    }
}
