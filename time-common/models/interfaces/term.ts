import { Document, Types } from 'mongoose';
import { IAttributeRef } from './';

export interface ITerm extends Document {
	name: string;
	pluralName: string;
	slug: string;
	description?: string;
	taxonomy: Types.ObjectId;
	children: ITerm[];
	parent: ITerm;
	ancestors: ITerm[];

    settings?: {
		attributes: {
			default?: IAttributeRef[];
			variable?: Types.ObjectId[];
		};
	};
}