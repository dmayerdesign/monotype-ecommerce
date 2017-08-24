import { Document, Types } from 'mongoose'

export interface ITaxonomyTerm extends Document {
	taxonomy: Types.ObjectId | string
	name: string
	pluralName: string
	slug: string
	description?: string
	children: Array<Types.ObjectId | string>
	parent: Types.ObjectId | string
	ancestors: Array<Types.ObjectId | string>

    settings: {
		attributeValues: Array<Types.ObjectId | string>
		variableAttributes: Array<Types.ObjectId | string>
	}
}