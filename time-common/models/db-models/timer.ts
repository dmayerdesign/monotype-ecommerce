import mongoose from 'mongoose';

export const timerSchema = new mongoose.Schema({
	type: String,
	endpoint: String,
	method: String,
	startedAt: Number,
	duration: Number,
	data: {},
}, { timestamps: true });

export const timer = mongoose.model('Timer', timerSchema);
