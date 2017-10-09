import { model, Schema } from 'mongoose'

import { ITaxonomy } from '../interfaces/taxonomy'

export const taxonomySchema = new Schema({
    name: String,
    pluralName: String,
    slug: String,
    description: String,
})

export const Taxonomy = model<ITaxonomy>('Taxonomy', taxonomySchema)
