import { model, Schema } from 'mongoose'
import { IAttributeValue } from '../interfaces'

export const attributeValueSchema = new Schema({
    attribute: Schema.Types.ObjectId,
    name: String,
    slug: String,
    description: String,
})

export const AttributeValue = model<IAttributeValue>('AttributeValue', attributeValueSchema)
