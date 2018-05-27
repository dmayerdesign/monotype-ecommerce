import { prop, schema, MongooseDocument } from '../../lib/goosetype'
import { Price } from './price'

@schema(OrganizationRetailSettings)
export class OrganizationRetailSettings extends MongooseDocument {
    @prop() public salesTaxPercentage: number
    @prop() public addSalesTax?: boolean
    @prop() public shippingFlatRate?: Price
}
