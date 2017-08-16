import { Document, Types } from 'mongoose';

export interface ITerm extends Document {
	taxonomy: Types.ObjectId | string;
	name: string;
	pluralName: string;
	slug: string;
	description?: string;
	children: Array<Types.ObjectId | string>;
	parent: Types.ObjectId | string;
	ancestors: Array<Types.ObjectId | string>;

    settings: {
		attributes: {
			default: Array<Types.ObjectId | string>;
			variable: Array<Types.ObjectId | string>;
		};
	};
}