import { arrayProp, prop, MongooseDocument, MongooseSchemaOptions } from '../../lib/goosetype'
import { Ref } from '../../lib/goosetype/goosetype'
import { GlobalStyles } from './global-styles'
import { OrganizationBranding } from './organization-branding'
import { OrganizationRetailSettings } from './organization-retail-settings'
import { Taxonomy } from './taxonomy'
import { UiContent } from './ui-content'

export class Organization extends MongooseDocument {
    @prop() public name: string
    @prop() public retailSettings: OrganizationRetailSettings
    @prop() public branding: OrganizationBranding
    @prop() public storeUiContent: UiContent
    @prop() public blogUiContent?: UiContent
    @arrayProp({ itemsRef: Taxonomy }) public searchableTaxonomies?: Ref<Taxonomy>[]
    @prop() public globalStyles?: GlobalStyles
}
export const OrganizationModel = new Organization().getModel(MongooseSchemaOptions.timestamped)

// Errors.

export class CreateOrganizationError extends Error { }
export class FindOrganizationError extends Error { }
export class UpdateOrganizationError extends Error { }
export class DeleteOrganizationError extends Error { }
