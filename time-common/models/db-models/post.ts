import mongoose from 'mongoose';

export const linkEmbedSchema = new mongoose.Schema({
	url: String,
	type: String,
	thumbnail_url: String,
	title: String,
	description: String,
	provider_url: String,
});

export const postSchema = new mongoose.Schema({
	author: {
		userId: String,
		firstName: String,
		lastName: String,
	},
	type: {type: String, default: 'normal'},
	content: String,
	eventDate: Date,
	eventLocation: String,
	tags: [String],
	usersMentioned: [String],
	images: [String],
	linkEmbed: linkEmbedSchema,
	comments: [
		{
			author: {
				userId: String,
				firstName: String,
				lastName: String,
			},
			content: String,
			usersMentioned: [String],
			images: [String],
			linkEmbed: linkEmbedSchema,
			reactions: {
				up: [String],
				down: [String],
			},
		},
	],
	reactions: {
		up: [String],
		down: [String],
	}
}, { timestamps: true });

export const post = mongoose.model('Post', postSchema);
