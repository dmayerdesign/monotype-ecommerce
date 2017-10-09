import { model, Schema } from 'mongoose'
import { IOrganization } from '../interfaces/organization'

export const organizationSchema = new Schema({
    name: String,
    retailSettings: {
        salesTaxPercentage: Number,
    },
}, { timestamps: true })

export const Organization = model<IOrganization>('Organization', organizationSchema)
