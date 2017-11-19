import 'stripe'

import { OrderStatus } from '../types'
import { IDiscount } from './discount'
import { IOrderCustomer } from './order-customer'

export interface IOrder {
    items: string[]
    discounts: string[]|IDiscount[]
    total: {
        amount: number
        currency: string
    }
    taxPercent: number
    shippingCost: number
    shippingRates: any[]
    selectedShippingRate: any
    shippingInsuranceAmt: number
    carrier: string
    trackingCode: string
    estDeliveryDays: number
    postageLabel: any

    paymentMethod: string
    savePaymentInfo: boolean
    shipmentId: string
    status: OrderStatus

    stripeCard: StripeNode.cards.ICard
    stripeOrderId: string
    stripeSource: string
    stripeToken: string
    stripeTokenObject: StripeNode.tokens.ICardToken

    customer: IOrderCustomer
}
