import { prop, schema, MongooseDocument, MongooseSchemaOptions } from '../../lib/goosetype'

// Brand colors.

@schema(OrganizationBrandingColors)
export class OrganizationBrandingColors extends MongooseDocument {
    @prop() public primary: string
}

// Branding.

@schema(OrganizationBranding)
export class OrganizationBranding extends MongooseDocument {
    @prop() public displayName: string
    @prop() public logo: string
    @prop() public colors: OrganizationBrandingColors
    @prop() public cartName: string
}
