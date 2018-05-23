import { GlobalStyles } from './global-styles'
import { MongooseDocument } from './mongoose-document'
import { OrganizationBranding } from './organization-branding'
import { OrganizationRetailSettings } from './organization-retail-settings'
import { Ref } from './ref'
import { Taxonomy } from './taxonomy'
import { UiContent } from './ui-content'

export interface Organization extends MongooseDocument {
    name: string
    dbaNames: string[]
    retailSettings: OrganizationRetailSettings
    branding: OrganizationBranding
    storeUiContent: UiContent
    blogUiContent?: UiContent
    searchableTaxonomies?: Ref<Taxonomy>[]
    globalStyles?: GlobalStyles
}
