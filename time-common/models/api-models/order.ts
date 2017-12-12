import { arrayProp, prop, MongooseDocument, MongooseSchemaOptions, Ref } from '../../utils/goosetype'
import { OrderStatus, OrderStatusEnum } from '../types/order-status'
import { Discount } from './discount'
import { EasypostRate } from './easypost-rate'
import { OrderCustomer } from './order-customer'
import { Price } from './price'
import { Product } from './product'
import { StripeCardToken } from './stripe-card-token'

export class Order extends MongooseDocument<Order> {
    @arrayProp({ itemsRef: Product }) public items: Ref<Product>[]
    @arrayProp({ itemsRef: Discount }) public discounts: Ref<Discount>[]
    @prop() public total: Price
    @prop() public taxPercent: number
    @prop() public shippingCost: number
    @arrayProp({ items: EasypostRate }) public shippingRates: EasypostRate[]
    @prop() public selectedShippingRateId: string
    @prop() public shippingInsuranceAmt: number
    @prop() public carrier: string
    @prop() public trackingCode: string
    @prop() public estDeliveryDays: number
    @prop() public postageLabelUrl: string
    @prop() public paymentMethod: string
    @prop() public savePaymentInfo: boolean
    @prop() public shipmentId: string
    @prop({ enum: Object.keys(OrderStatusEnum) }) public status: OrderStatus
    @prop() public stripeCardId: string
    @prop() public stripeOrderId: string
    @prop() public stripeSource: string
    @prop() public stripeToken: string
    @prop() public stripeTokenObject: StripeCardToken
    @prop() public customer: OrderCustomer
}

export const OrderModel = new Order().getModel(MongooseSchemaOptions.Timestamped)

export class CreateOrderError extends Error { }
export class FindOrderError extends Error { }
export class UpdateOrderError extends Error { }
export class DeleteOrderError extends Error { }
