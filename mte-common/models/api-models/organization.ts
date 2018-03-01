import { prop, MongooseDocument, MongooseSchemaOptions } from '../../lib/goosetype'
import { OrganizationBranding } from './organization-branding'
import { OrganizationRetailSettings } from './organization-retail-settings'
import { UiContent } from './ui-content'

export class Organization extends MongooseDocument {
    @prop() public name: string
    @prop() public retailSettings: OrganizationRetailSettings
    @prop() public branding: OrganizationBranding
    @prop() public storeUiContent: UiContent
    @prop() public blogUiContent?: UiContent
}
export const OrganizationModel = new Organization().getModel(MongooseSchemaOptions.timestamped)

// Errors.

export class CreateOrganizationError extends Error { }
export class FindOrganizationError extends Error { }
export class UpdateOrganizationError extends Error { }
export class DeleteOrganizationError extends Error { }
