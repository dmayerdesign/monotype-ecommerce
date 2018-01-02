import { Document } from 'mongoose'
import { IPrice } from './price'

export interface IOrganization extends Document {
    name: string
    retailSettings: {
        salesTaxPercentage: number
        addSalesTax: boolean
        shippingFlatRate: IPrice
    }
}
