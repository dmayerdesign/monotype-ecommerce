import { Schema, Model, model } from 'mongoose';

export const attributeRefSchema = new Schema({
	key: String,
	value: Schema.Types.Mixed,
	visible: Boolean,
});

export const attributeSchema = new Schema({
	name: String,
	key: String,
	values: [Schema.Types.Mixed],
	visible: Boolean,
});

export const Attribute = model('Attribute', attributeSchema);
