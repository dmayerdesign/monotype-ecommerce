import { Schema, Model, model } from 'mongoose';

export const timerSchema = new Schema({
	type: String,
	endpoint: String,
	method: String,
	startedAt: Number,
	duration: Number,
	data: {},
}, { timestamps: true });

export const Timer: Model<any> = model('Timer', timerSchema);
