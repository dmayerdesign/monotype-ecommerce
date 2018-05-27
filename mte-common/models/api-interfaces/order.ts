import { OrderStatus } from '../enums/order-status'
import { Discount } from './discount'
import { EasypostRate } from './easypost-rate'
import { MongooseDocument } from './mongoose-document'
import { OrderCustomer } from './order-customer'
import { Price } from './price'
import { Product } from './product'
import { Ref } from './ref'
import { StripeCardToken } from './stripe-card-token'

export interface Order extends MongooseDocument {
    items: Ref<Product>[]
    discounts: Ref<Discount>[]
    total: Price
    taxPercent: number
    shippingCost: Price
    shippingRates: EasypostRate[]
    selectedShippingRateId: string
    shippingInsuranceAmt: number
    carrier: string
    trackingCode: string
    estDeliveryDays: number
    postageLabelUrl: string
    paymentMethod: string
    savePaymentInfo: boolean
    shipmentId: string
    status: OrderStatus
    stripeCardId: string
    stripeOrderId: string
    stripeSource: string
    stripeToken: string
    stripeTokenObject: StripeCardToken
    customer: OrderCustomer
}
