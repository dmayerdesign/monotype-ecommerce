import { prop } from 'typegoose'

export class Address {
    @prop() public name?: string
    @prop() public company?: string
    @prop() public street1: string
    @prop() public street2?: string
    @prop() public city?: string
    @prop() public state?: string
    @prop() public province?: string
    @prop() public country?: string
    @prop() public zip: string
    @prop() public phone?: string
}
