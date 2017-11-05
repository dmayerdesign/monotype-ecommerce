import { prop } from 'typegoose'

import { timestamped, TimeModel } from './time-model'

export class OrganizationRetailSettings {
    @prop() public salesTaxPercentage: number
}

export class Organization extends TimeModel {
    @prop() public name: string
    @prop() public retailSettings: OrganizationRetailSettings
}

export const OrganizationModel = new Organization().getModelForClass(Organization, timestamped)
