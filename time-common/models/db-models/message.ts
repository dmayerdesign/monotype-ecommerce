import { Schema, Model, model } from 'mongoose';

export const messageSchema: Schema = new Schema({
	author: {
		userId: String,
		firstName: String,
		lastName: String,
	},
	recipient: {
		userId: String,
		firstName: String,
		lastName: String,
	},
	content: String,
	read: Boolean,
}, { timestamps: true });

export const Message: Model<any> = model('Message', messageSchema);
