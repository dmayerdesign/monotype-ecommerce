import { arrayProp, prop, Ref, Typegoose } from 'typegoose'

import { OrderStatus, OrderStatusEnum } from '../types'
import { Discount } from './discount'
import { OrderCustomer } from './order-customer'
import { Price } from './price'
import { Product } from './product'

export class Order extends Typegoose {
    public _id: string
    @arrayProp({ itemsRef: Product }) public items: Ref<Product>[]
    @arrayProp({ itemsRef: Discount }) public discounts: Ref<Discount>[]
    @prop() public total: Price
    @prop() public taxPercent: number
    @prop() public shippingCost: number
    // @arrayProp({ items: String }) public shippingRates: string[]
    // @prop() public selectedShippingRate: any
    // https://www.easypost.com/docs/api/node.html#rates
    @prop() public shippingInsuranceAmt: number
    @prop() public carrier: string
    @prop() public trackingCode: string
    @prop() public estDeliveryDays: number
    @prop() public postageLabel: any
    @prop() public paymentMethod: string
    @prop() public savePaymentInfo: boolean
    @prop() public shipmentId: string
    @prop({ enum: OrderStatusEnum }) public status: OrderStatus
    @prop() public stripeCardId: string
    @prop() public stripeOrderId: string
    @prop() public stripeSource: string
    @prop() public stripeToken: string
    @prop() public stripeTokenObject: StripeNode.tokens.ICardToken
    @prop() public customer: OrderCustomer
}

export const OrderModel = new Order().getModelForClass(Order, { schemaOptions: { timestamps: true } })
