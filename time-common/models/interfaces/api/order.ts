import 'stripe'

import { OrderStatus } from '../../enums/order-status'
import { IDiscount } from './discount'
import { IOrderCustomer } from './order-customer'
import { IPrice } from './price'

export interface IOrder {
    items: string[]
    discounts: string[]|IDiscount[]
    total: IPrice
    taxPercent: number
    shippingCost: IPrice
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
