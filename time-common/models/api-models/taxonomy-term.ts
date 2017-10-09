import { model, Schema } from 'mongoose'
import { ITaxonomyTerm } from '../interfaces'

export const taxonomyTermSchema = new Schema({
    taxonomy: Schema.Types.ObjectId,
    name: String,
    pluralName: String,
    slug: String,
    description: String,
    children: [Schema.Types.ObjectId],
    parent: Schema.Types.ObjectId,
    ancestors: [Schema.Types.ObjectId],

    settings: {
        attributeValues: [Schema.Types.ObjectId],
        variableAttributes: [Schema.Types.ObjectId],
    },
})

export const TaxonomyTerm = model<ITaxonomyTerm>('TaxonomyTerm', taxonomyTermSchema)
