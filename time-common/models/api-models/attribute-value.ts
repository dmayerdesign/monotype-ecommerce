import { Schema, Model, model } from 'mongoose'

export const attributeValueSchema = new Schema({
    attribute: Schema.Types.ObjectId,
	name: String,
	slug: String,
	description: String,
})

export const AttributeValue = model('AttributeValue', attributeValueSchema)
