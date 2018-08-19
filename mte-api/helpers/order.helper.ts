import { Copy } from '@mte/common/constants/copy'
import { CartHelper } from '@mte/common/helpers/cart.helper'
import { injectable } from 'inversify'

@injectable()
export class OrderHelper {
    public getSubTotal = CartHelper.getSubTotal
    public getTotal = CartHelper.getTotal

    public calculateEstArrival(days: number): string {
        const currentMillis = Date.now()
        const estArrivalDate = new Date((currentMillis + (days * 86400000)))
        const daysOfTheWeek = Copy.DaysOfTheWeek
        const months = Copy.Months
        return `${daysOfTheWeek[estArrivalDate.getDay()]}, ${months[estArrivalDate.getMonth()]} ${estArrivalDate.getDate()}`
    }
}
