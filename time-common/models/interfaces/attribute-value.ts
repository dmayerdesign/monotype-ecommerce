import { Document, Types } from 'mongoose'

export interface IAttributeValue extends Document {
    attribute: Types.ObjectId | string
    name: string // "Blue" | "Medium"
    slug: string
    description?: string
}
