import {} from 'stripe'

import { OrderCustomer } from '../models/api-interfaces/order-customer'
import { Price } from '../models/api-interfaces/price'
import { OrderStatus } from '../models/enums/order-status'

export class OrderBuilder {
    public discounts: string[]
    public total: Price
    public taxPercent: number
    public shippingCost: Price
    public shippingRates: any[]
    public selectedShippingRate: any
    public shippingInsuranceAmt: number
    public carrier: string
    public trackingCode: string
    public estDeliveryDays: number
    public postageLabel: any
    public paymentMethod: string
    public savePaymentInfo: boolean
    public shipmentId: string
    public status: OrderStatus
    public stripeCard: StripeNode.cards.ICard
    public stripeOrderId: string
    public stripeSource: string
    public stripeToken: string
    public stripeTokenObject: StripeNode.tokens.ICardToken
    public customer: OrderCustomer

    constructor(public items: string[]) {
        this.status = OrderStatus.Pending
    }
}
