import { prop } from '../../utils/goosetype'

import { StripeCardHash } from './stripe-card-hash'

export class StripeCardToken {
    @prop() public object: string
    @prop() public id: string
    @prop() public client_ip: string
    @prop() public created: number
    @prop() public livemode: boolean
    @prop() public type: string /* "card" | "bank_account" */
    @prop() public used: boolean
    @prop() public card?: StripeCardHash
}
