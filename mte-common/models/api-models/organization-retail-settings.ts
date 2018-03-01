import { prop, MongooseDocument } from '../../lib/goosetype'
import { Price } from './price'

export class OrganizationRetailSettings extends MongooseDocument {
    @prop() public salesTaxPercentage: number
    @prop() public addSalesTax?: boolean
    @prop() public shippingFlatRate?: Price
}
new OrganizationRetailSettings().getSchema()
