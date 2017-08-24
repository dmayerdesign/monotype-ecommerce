import { Schema, Model, model } from 'mongoose'

export const taxonomySchema = new Schema({
	name: String,
	pluralName: String,
	slug: String,
	description: String,
})

export const Taxonomy = model('Taxonomy', taxonomySchema)
