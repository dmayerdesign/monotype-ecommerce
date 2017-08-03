import { Schema, Model, model } from 'mongoose';
import { IProduct } from '../';
import { attributeSchema, attributeRefSchema } from './';

export const productSchema = new Schema({
	/* Aesthetic */
	name: String,
	slug: {type: String, trim: true, lowercase: true},
	description: String,
	featuredImages: [String],
	images: [String],
	largeImages: [String],
	thumbnails: [String],

	/* Technical */
	SKU: {type: String, unique: true},
	price: Number,
	priceRange: [Number],
	salePrice: Number,
	salePriceRange: [Number],
	onSale: Boolean,
	class: String,
	isStandalone: Boolean,
	isParent: Boolean, 				// Defines an abstract parent for a variable product
	variationSKUs: [String], 		// Array of product SKUs
	isVariation: Boolean, 			// Defines a product variation with a parent product
	isDefaultVariation: Boolean, 	// Defines the default product variation
	parentSKU: String, 				// The SKU of the parent product

	attributes: [attributeRefSchema],
	variableAttributes: [String],

	/* Shipping */
	units: { 						// Only if not using global defaults
		weight: String,
		length: String
	},
	dimensions: {
		length: Number,
		width: Number,
		height: Number
	},
	shippingWeight: Number,
	netWeight: Number,

	/* Additional tax */
	additionalTax: Number,

	/* Organizational */
	taxonomies: [{
		key: String,
		values: [String]
	}],

	stockQuantity: Number,
	totalSales: Number,

	enteredIntoStripe: Boolean,

}, { timestamps: true });

// .index({ name: "text", description: "text" });

productSchema.pre('save', function(next) {
	let product = this;
  if (!product.slug && product.isNew) {
    product.slug = product.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
  }
  if (product.isNew || product.isModified('class')) {
  	product.isStandalone = product.class === 'standalone';
  	product.isParent = product.class === 'parent';
  	product.isVariation = product.class === 'variation';
  }
  next();
});

export const Product: Model<IProduct> = model('Product', productSchema);
