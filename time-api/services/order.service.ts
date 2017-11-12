import { injectable } from 'inversify'

@injectable()
export class OrderService {
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
}
