import { Document, Types } from 'mongoose';

export interface IAttributeRef {
    key: string;
    value: string;
    visible?: boolean; // Defaults to value set on Attribute
}

export interface IProduct extends Document {
	/* Aesthetic */
	name: string;
	slug: string;
	description?: string;
	featuredImages?: string[];
	images?: string[];
	largeImages?: string[];
	thumbnails?: string[];

	/* Technical */
	SKU: string;
	price?: number;
	priceRange?: number[];
	salePrice?: number;
	salePriceRange?: number[];
	onSale?: boolean;
	class: 'standalone' | 'parent' | 'variation';
	isStandalone?: boolean;
	isParent?: boolean; // Defines an abstract parent for a variable product
	variationSKUs?: string[]; // Array of product slugs
	isVariation?: boolean; // Defines a product variation with a parent product
	parentSKU?: string; // The slug of the parent product

	/* Attributes */
	attributes?: IAttributeRef[];
	variableAttributes?: string[];

	/* Taxonomy */
	taxonomyTerms: Array<Types.ObjectId | string>;
	taxonomyTermSlugs: string[];

	/* Shipping */
	units?: { // Only if not using global defaults
		weight?: string;
		length?: string;
	};
	dimensions?: {
		length?: number;
		width?: number;
		height?: number;
	};
	shippingWeight?: number;
	netWeight?: number;

	/* Additional tax */
	additionalTax?: number;

	/* Sales */
	stockQuantity?: number;
	totalSales?: number;
	enteredIntoStripe?: boolean;
}