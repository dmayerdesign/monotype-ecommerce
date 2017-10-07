import { model, Model, Schema } from 'mongoose'
import { IProduct } from '../interfaces/product'

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
    price: {
        total: Number,
        currency: String,
    },
    priceRange: [{
        total: Number,
        currency: String,
    }],
    salePrice: {
        total: Number,
        currency: String,
    },
    salePriceRange: [{
        total: Number,
        currency: String,
    }],
    onSale: Boolean,
    class: String,
    isStandalone: Boolean,
    isParent: Boolean, 				// Defines an abstract parent for a variable product
    variationSKUs: [String], 		// Array of product SKUs
    isVariation: Boolean, 			// Defines a product variation with a parent product
    isDefaultVariation: Boolean, 	// Defines the default product variation
    parentSKU: String, 				// The SKU of the parent product

	/* Attributes */
	/* own attributes */
    attributeValues: [{
        attributeId: Schema.Types.ObjectId,
        attribute: String, // Attribute.slug
        valueId: Schema.Types.ObjectId,
        value: Schema.Types.Mixed,
    }],
	/* variation attributes */
    variableAttributes: [Schema.Types.ObjectId], // Attribute IDs
    variableAttributeValues: [{
        attributeId: Schema.Types.ObjectId,
        attribute: String,
        valueId: Schema.Types.ObjectId,
        value: Schema.Types.Mixed,
    }],

	/* Taxonomy */
    taxonomyTerms: [Schema.Types.ObjectId],
    taxonomyTermSlugs: [String],

	/* Shipping */
    units: { 						// Only if not using global defaults
        weight: String,
        length: String,
    },
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
    },
    shippingWeight: Number,
    netWeight: Number,

	/* Additional tax */
    additionalTax: Number,

	/* Sales */
    stockQuantity: Number,
    totalSales: Number,
    isEnteredIntoStripe: Boolean,

}, { timestamps: true })

productSchema.pre('save', function(next) {
    const product = <IProduct>this
    if (!product.slug && product.isNew) {
        product.slug = product.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-")
    }
    if (product.isNew || product.isModified('class')) {
        product.isStandalone = product.class === 'standalone'
        product.isParent = product.class === 'parent'
        product.isVariation = product.class === 'variation'
    } else if (product.isModified('isStandalone') || product.isModified('isParent') || product.isModified('isVariation')) {
        product.class = product.isVariation ? 'variation' : product.isParent ? 'parent' : 'standalone'
    }
    next()
})

export const Product: Model<IProduct> = model('Product', productSchema)
