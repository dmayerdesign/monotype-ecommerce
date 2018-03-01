import { prop, MongooseDocument, MongooseSchemaOptions } from '../../lib/goosetype'

// Brand colors.

export class OrganizationBrandingColors extends MongooseDocument {
    @prop() public primary: string
}
new OrganizationBrandingColors().getSchema()

// Branding.

export class OrganizationBranding extends MongooseDocument {
    @prop() public logo: string
    @prop() public colors: OrganizationBrandingColors
}
new OrganizationBranding().getSchema()
