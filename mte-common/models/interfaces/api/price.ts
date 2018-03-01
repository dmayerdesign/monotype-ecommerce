import { Currency } from '../../enums/currency'

export interface Price {
    amount: number
    currency: Currency | string
}
