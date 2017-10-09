import { model, Schema } from 'mongoose'

import { IAttribute } from '../interfaces/attribute'

export const attributeSchema = new Schema({
    name: String,
    pluralName: String,
    slug: String,
    description: String,
})

export const Attribute = model<IAttribute>('Attribute', attributeSchema)
