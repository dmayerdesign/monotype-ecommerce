import { prop, MongooseDocument, MongooseSchemaOptions } from '../../lib/goosetype'
import { Price } from './price'

// db.organizations.insert({ name: "Hyzer Shop", retailSettings: { salesTaxPercentage: 6, addSalesTax: false, shippingFlatRate: { amount: 5, currency: "USD" } }, branding: { logo: "https://d1eqpdomqeekcv.cloudfront.net/branding/hyzershop-wordmark-250.png", colors: { primary: "#00b0ff" } } })

// Retail settings.

export class OrganizationRetailSettings extends MongooseDocument<OrganizationRetailSettings> {
    @prop() public salesTaxPercentage: number
    @prop() public addSalesTax?: boolean
    @prop() public shippingFlatRate?: Price
}
new OrganizationRetailSettings().getSchema()

// Brand colors.

export class OrganizationBrandingColors extends MongooseDocument<OrganizationBrandingColors> {
    @prop() public primary: string
}
new OrganizationBrandingColors().getSchema()

// Branding.

export class OrganizationBranding extends MongooseDocument<OrganizationBranding> {
    @prop() public logo: string
    @prop() public colors: OrganizationBrandingColors
}
new OrganizationBranding().getSchema()

// Organization.

export class Organization extends MongooseDocument<Organization> {
    @prop() public name: string
    @prop() public retailSettings: OrganizationRetailSettings
    @prop() public branding: OrganizationBranding
}
export const OrganizationModel = new Organization().getModel(MongooseSchemaOptions.Timestamped)

// Errors.

export class CreateOrganizationError extends Error { }
export class FindOrganizationError extends Error { }
export class UpdateOrganizationError extends Error { }
export class DeleteOrganizationError extends Error { }
