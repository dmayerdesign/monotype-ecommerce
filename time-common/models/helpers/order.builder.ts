import { CurrencyEnum } from '../../constants'
import { IOrder, IOrderCustomer, IPrice } from '../interfaces'
import { OrderStatus, OrderStatusEnum } from '../types/order-status'

export class OrderBuilder implements IOrder {
    public discounts: string[]
    public total: {
        amount: number
        currency: string
    }
    public taxPercent: number
    public shippingCost: number
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
    public customer: IOrderCustomer

    constructor(public items: string[]) {
        this.status = OrderStatusEnum.Pending
    }
}
