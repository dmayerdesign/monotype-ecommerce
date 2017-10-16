import { IAddress } from './address'

export interface IOrderCustomer {
    userId: string
    stripeCustomerId: string
    email: string
    lastName: string
    firstName: string
    shippingAddress: IAddress
    billingAddress: IAddress
}
