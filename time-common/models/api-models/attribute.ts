import { Schema, Model, model } from 'mongoose'

export const attributeSchema = new Schema({
	name: String,
	pluralName: String,
	slug: String,
	description: String,
})

export const Attribute = model('Attribute', attributeSchema)
