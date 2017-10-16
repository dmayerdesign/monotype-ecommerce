import { model, Schema } from 'mongoose'

import { IOrder } from '../interfaces/order'
import { addressSchema } from './address'

export const orderSchema = new Schema({
    items: [String],
    discounts: [String],
    total: {
        amount: Number,
        currency: String,
    },
    taxPercent: Number,
    shippingCost: Number,
    shippingRates: [],
    selectedShippingRate: {},
    shippingInsuranceAmt: Number,
    carrier: String,
    trackingCode: String,
    estDeliveryDays: Number,
    postageLabel: {},

    paymentMethod: String,
    savePaymentInfo: Boolean,
    shipmentId: String,
    status: String,

    stripeCard: {},
    stripeOrderId: String,
    stripeSource: String,
    stripeToken: String,
    stripeTokenObject: {},

    customer: {
        userId: String,
        stripeCustomerId: String,
        email: String,
        lastName: String,
        firstName: String,
        shippingAddress: addressSchema,
        billingAddress: addressSchema,
    },
})

export const Order = model<IOrder>('Order', orderSchema)
