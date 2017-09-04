import { Schema, Model, model } from 'mongoose';

export const revisionSchema = new Schema({
	id: Schema.Types.ObjectId,
	field: String,
	value: {},
	meta: {},
}, { timestamps: true });

export const Revision: Model<any> = model('Revision', revisionSchema);
