import { prop, MongooseDocument } from '../../lib/goosetype'

import { StripeCardHash } from './stripe-card-hash'

export class StripeCardToken extends MongooseDocument {
    @prop() public object: string
    @prop() public id: string
    @prop() public client_ip: string
    @prop() public created: number
    @prop() public livemode: boolean
    @prop() public type: string /* "card" | "bank_account" */
    @prop() public used: boolean
    @prop() public card?: StripeCardHash
}
new StripeCardToken().getSchema()
