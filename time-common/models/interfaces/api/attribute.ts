import { Document } from 'mongoose'

export interface IAttribute extends Document {
    name: string // "Color", "Size"
    pluralName?: string
    slug: string
    description?: string
}
