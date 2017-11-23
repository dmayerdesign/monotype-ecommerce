import { prop } from 'typegoose'
import { timestamped, BaseApiModel } from './base-api-model'

export class OrganizationRetailSettings {
    @prop() public salesTaxPercentage: number
}

export class Organization extends BaseApiModel<Organization> {
    @prop() public name: string
    @prop() public retailSettings: OrganizationRetailSettings
}

export const OrganizationModel = new Organization().getModelForClass(Organization, timestamped)

export class CreateOrganizationError extends Error { }
export class FindOrganizationError extends Error { }
export class UpdateOrganizationError extends Error { }
export class DeleteOrganizationError extends Error { }
