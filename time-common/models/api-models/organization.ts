import { prop, Model, MongooseSchemaOptions } from '../../utils/goosetype'

export class OrganizationRetailSettings {
    @prop() public salesTaxPercentage: number
}

export class Organization extends Model<Organization> {
    @prop() public name: string
    @prop() public retailSettings: OrganizationRetailSettings
}

export const OrganizationModel = new Organization().getModel(MongooseSchemaOptions.Timestamped)

export class CreateOrganizationError extends Error { }
export class FindOrganizationError extends Error { }
export class UpdateOrganizationError extends Error { }
export class DeleteOrganizationError extends Error { }
