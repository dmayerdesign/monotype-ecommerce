import { Document, Types } from 'mongoose'

import { IPrice } from './price'

export interface IDiscount extends Document {
    code: string
    amount: IPrice
    percentage: number // `20` for a 20% discount
    freeShipping: boolean
    includes: {
        products: Array<Types.ObjectId|string>
        terms: Array<Types.ObjectId|string>
    }
    excludes: {
        products: Array<Types.ObjectId|string>
        terms: Array<Types.ObjectId|string>
    }
}
