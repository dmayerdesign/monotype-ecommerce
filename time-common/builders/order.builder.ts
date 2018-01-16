import { OrderStatus } from '../models/enums/order-status'
import { IOrder } from '../models/interfaces/api/order'
import { IOrderCustomer } from '../models/interfaces/api/order-customer'
import { IPrice } from '../models/interfaces/api/price'

export class OrderBuilder implements IOrder {
    public discounts: string[]
    public total: IPrice
    public taxPercent: number
    public shippingCost: IPrice
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
        this.status = OrderStatus.Pending
    }
}
