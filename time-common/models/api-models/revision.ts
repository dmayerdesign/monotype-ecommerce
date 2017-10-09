import { model, Schema } from 'mongoose'

export const revisionSchema = new Schema({
    id: Schema.Types.ObjectId,
    field: String,
    value: {},
    meta: {},
}, { timestamps: true })

export const Revision = model<any>('Revision', revisionSchema)
