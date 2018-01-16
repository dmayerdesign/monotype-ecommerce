import { Currency } from '../../enums/currency'

export interface IPrice {
    amount: number
    currency: Currency | string
}
