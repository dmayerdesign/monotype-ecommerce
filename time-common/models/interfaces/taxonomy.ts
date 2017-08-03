import { Document, Types } from 'mongoose';
import { ITerm } from './';

export interface ITaxonomy extends Document {
	name: string; // "Disc Type" | "Brand",
	pluralName: string;
	description?: string;
	key: string; // "disc-type" | "brand",
	terms: Types.ObjectId[];
}

export interface ITaxonomyRef {
	key: string;
	values: string[];
}