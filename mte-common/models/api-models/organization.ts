import { arrayProp, model, prop, MongooseDocument, MongooseSchemaOptions } from '../../lib/goosetype'
import { Ref } from '../../lib/goosetype'
import { GlobalStyles } from './global-styles'
import { OrganizationBranding } from './organization-branding'
import { OrganizationRetailSettings } from './organization-retail-settings'
import { Taxonomy } from './taxonomy'
import { UiContent } from './ui-content'

@model(Organization, MongooseSchemaOptions.timestamped)
export class Organization extends MongooseDocument {
    @prop() public name: string
    @prop() public retailSettings: OrganizationRetailSettings
    @prop() public branding: OrganizationBranding
    @prop() public storeUiContent: UiContent
    @prop() public blogUiContent?: UiContent
    @arrayProp({ itemsRef: Taxonomy }) public searchableTaxonomies?: Ref<Taxonomy>[]
    @prop() public globalStyles?: GlobalStyles
}

// Errors.

export class CreateOrganizationError extends Error { }
export class FindOrganizationError extends Error { }
export class UpdateOrganizationError extends Error { }
export class DeleteOrganizationError extends Error { }
