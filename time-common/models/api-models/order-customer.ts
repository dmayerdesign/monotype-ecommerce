import { prop } from '../../utils/goosetype'
import { Address } from './address'

export class OrderCustomer {
    @prop() public userId: string
    @prop() public stripeCustomerId: string
    @prop() public email: string
    @prop() public lastName: string
    @prop() public firstName: string
    @prop() public shippingAddress: Address
    @prop() public billingAddress: Address
}
