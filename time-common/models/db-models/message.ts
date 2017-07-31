import mongoose from 'mongoose';

export const messageSchema = new mongoose.Schema({
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

export const message = mongoose.model('Message', messageSchema);
