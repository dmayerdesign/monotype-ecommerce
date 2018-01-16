import { injectable } from 'inversify'

import { Copy } from '@time/common/constants/copy'

@injectable()
export class OrderHelper {
    public calculateEstArrival(days: number): string {
        const currentMillis = Date.now()
        const estArrivalDate = new Date((currentMillis + (days * 86400000)))
        const daysOfTheWeek = Copy.DaysOfTheWeek
        const months = Copy.Months
        return `${daysOfTheWeek[estArrivalDate.getDay()]}, ${months[estArrivalDate.getMonth()]} ${estArrivalDate.getDate()}`
    }
}
