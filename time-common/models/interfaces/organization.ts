import { Document } from 'mongoose'

export interface IOrganization extends Document {
    name: string
    retailSettings: {
        salesTaxPercentage: number
    }
}
