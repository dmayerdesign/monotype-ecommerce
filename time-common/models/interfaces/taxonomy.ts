import { Document, Types } from 'mongoose';

export interface ITaxonomy extends Document {
	name: string; // "Disc Type" | "Brand",
	pluralName: string;
	slug: string; // "disc-type" | "brand",
	description?: string;
}
