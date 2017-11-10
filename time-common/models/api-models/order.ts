import { Schema } from 'mongoose'
import Easypost from 'node-easypost'
import { arrayProp, prop, Ref } from 'typegoose'

import { OrderStatus, OrderStatusEnum } from '../types/order-status'
import { Discount } from './discount'
import { OrderCustomer } from './order-customer'
import { Price } from './price'
import { Product } from './product'
import { timestamped, TimeModel } from './time-model'

export class Order extends TimeModel {
    @arrayProp({ itemsRef: Product }) public items: Ref<Product>[]
    @arrayProp({ itemsRef: Discount }) public discounts: Ref<Discount>[]
    @prop() public total: Price
    @prop() public taxPercent: number
    @prop() public shippingCost: number
    @arrayProp({ items: Schema.Types.Mixed }) public shippingRates: Easypost.Rate[]
    @prop() public selectedShippingRateId: any
    @prop() public shippingInsuranceAmt: number
    @prop() public carrier: string
    @prop() public trackingCode: string
    @prop() public estDeliveryDays: number
    @prop() public postageLabel: any
    @prop() public paymentMethod: string
    @prop() public savePaymentInfo: boolean
    @prop() public shipmentId: string
    @prop({ enum: Object.keys(OrderStatusEnum) }) public status: OrderStatus
    @prop() public stripeCardId: string
    @prop() public stripeOrderId: string
    @prop() public stripeSource: string
    @prop() public stripeToken: string
    @prop() public stripeTokenObject: StripeNode.tokens.ICardToken
    @prop() public customer: OrderCustomer
}

export const OrderModel = new Order().getModelForClass(Order, timestamped)

export class CreateOrderError extends Error { }
export class FindOrderError extends Error { }
export class UpdateOrderError extends Error { }
export class DeleteOrderError extends Error { }
