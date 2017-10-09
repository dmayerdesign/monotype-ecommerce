import { model, Schema } from 'mongoose'

import { IDiscount } from '../interfaces/discount'

export const discountSchema = new Schema({
    code: String,
    amount: {
        total: Number,
        currency: String,
    },
    percentage: Number, // `20` for a 20% discount
    freeShipping: Boolean,
    includes: {
        products: [Schema.Types.ObjectId],
        terms: [Schema.Types.ObjectId],
    },
    excludes: {
        products: [Schema.Types.ObjectId],
        terms: [Schema.Types.ObjectId],
    },
})

export const Discount = model<IDiscount>('Discount', discountSchema)
