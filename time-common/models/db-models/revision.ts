import mongoose from 'mongoose';

export const revisionSchema = new mongoose.Schema({
	id: mongoose.Schema.Types.ObjectId,
	field: String,
	value: {},
	meta: {},
}, { timestamps: true });

export const revision = mongoose.model('Revision', revisionSchema);
