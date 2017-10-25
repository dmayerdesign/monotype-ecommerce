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

    public calculateEstArrival(days) {
        days = parseInt(days, 10)
        const currentMillis = Date.now()
        const estArrivalDate = new Date((currentMillis + (days * 86400000)))
        const daysOfTheWeek = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ]
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ]
        return `${daysOfTheWeek[estArrivalDate.getDay()]}, ${months[estArrivalDate.getMonth()]} ${estArrivalDate.getDate()}`
    }

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
