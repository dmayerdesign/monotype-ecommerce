import { prop, MongooseDocument, MongooseSchemaOptions } from '../../utils/goosetype'
import { Price } from './price'

export class OrganizationRetailSettings {
    @prop() public salesTaxPercentage: number
    @prop() public addSalesTax?: boolean
    @prop() public shippingFlatRate?: Price
}

export class Organization extends MongooseDocument<Organization> {
    @prop() public name: string
    @prop() public retailSettings: OrganizationRetailSettings
}

export const OrganizationModel = new Organization().getModel(MongooseSchemaOptions.Timestamped)

export class CreateOrganizationError extends Error { }
export class FindOrganizationError extends Error { }
export class UpdateOrganizationError extends Error { }
export class DeleteOrganizationError extends Error { }
