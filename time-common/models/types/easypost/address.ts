import { Verifications } from './address-verification'
import { Resource } from './resource'

export class Address extends Resource {
    public mode: string
    public street1: string
    public street2: string
    public city: string
    public state: string
    public zip: string
    public country: string
    public residential: boolean
    public carrier_facility: string
    public name: string
    public company: string
    public phone: string
    public email: string
    public federal_tax_id: string
    public state_tax_id: string
    public verifications: Verifications
}
