import { model, Model, Schema } from 'mongoose'

export const timerSchema = new Schema({
    type: String,
    endpoint: String,
    method: String,
    startedAt: Number,
    duration: Number,
    data: {},
}, { timestamps: true })

export const Timer = model<any>('Timer', timerSchema)
