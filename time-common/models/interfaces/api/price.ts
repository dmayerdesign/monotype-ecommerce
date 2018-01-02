import { Currency } from '../../enums/currency'

export interface IPrice {
    total: number
    currency: Currency | string
}
