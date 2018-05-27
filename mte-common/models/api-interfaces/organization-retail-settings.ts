import { MongooseDocument } from './mongoose-document'
import { Price } from './price'

export interface OrganizationRetailSettings extends MongooseDocument {
    salesTaxPercentage: number
    addSalesTax?: boolean
    shippingFlatRate?: Price
}
