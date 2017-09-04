import { Schema } from 'mongoose';

export const addressSchema: Schema = new Schema({
	name: String,
	company: String,
	street1: String,
	street2: String,
	city: String,
	state: String,
	province: String,
	country: String,
	zip: String,
	phone: String,
}, { _id: false });