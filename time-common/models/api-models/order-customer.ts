import { prop, MongooseDocument } from '../../lib/goosetype'
import { Address } from './address'

export class OrderCustomer extends MongooseDocument<OrderCustomer> {
    @prop() public userId: string
    @prop() public stripeCustomerId: string
    @prop() public email: string
    @prop() public lastName: string
    @prop() public firstName: string
    @prop() public shippingAddress: Address
    @prop() public billingAddress: Address
}
new OrderCustomer().getSchema()