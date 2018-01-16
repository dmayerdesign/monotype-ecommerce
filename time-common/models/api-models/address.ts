import { prop } from '../../lib/goosetype'

export class Address {
    @prop() public name?: string
    @prop() public company?: string
    @prop() public street1: string
    @prop() public street2?: string
    @prop() public city: string
    @prop() public state: string // State or province
    @prop() public country: string
    @prop() public zip: string
    @prop() public phone?: string
}
