import { prop, Typegoose } from 'typegoose'

export class OrganizationRetailSettings {
    @prop() public salesTaxPercentage: number
}

export class Organization extends Typegoose {
    @prop() public name: string
    @prop() public retailSettings: OrganizationRetailSettings
}

export const OrganizationModel = new Organization().getModelForClass(Organization, { schemaOptions: { timestamps: true } })
