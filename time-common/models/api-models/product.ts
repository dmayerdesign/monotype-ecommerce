import * as mongooseDelete from 'mongoose-delete'
import { arrayProp, plugin, pre, prop, Ref } from 'typegoose'

import { ProductClass, ProductClassEnum } from '../types/product-class'
import { Attribute } from './attribute'
import { AttributeValue } from './attribute-value'
import { timestamped, BaseApiModel } from './base-api-model'
import { Dimensions } from './dimensions'
import { Price } from './price'
import { TaxonomyTerm } from './taxonomy-term'
import { Units } from './units'

@plugin(mongooseDelete)
@pre<Product>('save', function(next) {
    const product = this
    if (!product.slug && product.isNew) {
        product.slug = product.name.trim().toLowerCase().replace(/[^a-z0-9]/g, "-")
    }
    if (product.slug && (product.isNew || product.isModified('slug'))) {
        product.slug = product.slug.trim().toLowerCase().replace(/[^a-z0-9]/g, "-")
    }
    if (product.isNew || product.isModified('class')) {
        product.isStandalone = product.class === 'standalone'
        product.isParent = product.class === 'parent'
        product.isVariation = product.class === 'variation'
    } else if (
        product.isModified('isStandalone') ||
        product.isModified('isParent') ||
        product.isModified('isVariation')
    ) {
        product.class = product.isVariation ? 'variation' : product.isParent ? 'parent' : 'standalone'
    }
    next()
})
export class Product extends BaseApiModel<Product> {
	/* Aesthetic */
    @prop() public name: string
    @prop() public slug: string
    @prop() public description: string
    @arrayProp({ items: String }) public featuredImages: string[]
    @arrayProp({ items: String }) public images: string[]
    @arrayProp({ items: String }) public largeImages: string[]
    @arrayProp({ items: String }) public thumbnails: string[]

	/* Technical */
    @prop({ unique: true }) public SKU: string
    @prop() public price: Price
    @arrayProp({ items: Price }) public priceRange: Price[]

    @prop() public salePrice: Price
    @arrayProp({ items: Price }) public salePriceRange: Price[]
    @prop() public isOnSale: boolean
    @prop({ enum: Object.keys(ProductClassEnum) }) public class: ProductClass
    @prop() public isStandalone: boolean
    @prop() public isParent: boolean 				                // Defines an abstract parent for a variable product
    @arrayProp({ items: String }) public variationSKUs: string[] 	// Array of product SKUs
    @arrayProp({ itemsRef: Product }) public variations: Ref<Product>[]
    @prop() public isVariation: boolean 			                // Defines a product variation with a parent product
    @prop() public isDefaultVariation: boolean 	                    // Defines the default product variation
    @prop() public parentSKU: string				                // The SKU of the parent product
    @prop({ ref: Product }) public parent: Ref<Product>

	/* Attributes */
	/* own attributes */
    @arrayProp({ itemsRef: AttributeValue }) public attributeValues: Ref<AttributeValue>[]
    @arrayProp({ items: String }) public attributeValueSlugs: string[]
	/* variation attributes */
    @arrayProp({ itemsRef: Attribute }) public variableAttributes: Ref<Attribute>[] // Attribute IDs
    @arrayProp({ itemsRef: AttributeValue }) public variableAttributeValues: Ref<AttributeValue>[]

	/* Taxonomy */
    @arrayProp({ itemsRef: TaxonomyTerm }) public taxonomyTerms: Ref<TaxonomyTerm>[]
    @arrayProp({ items: String }) public taxonomyTermSlugs: string[]

	/* Shipping */
    @prop() public units: Units
    @prop() public dimensions: Dimensions
    @prop() public shippingWeight: number
    @prop() public netWeight: number

	/* Additional tax */
    @prop() public additionalTax: number

	/* Sales */
    @prop() public stockQuantity: number
    @prop() public totalSales: number
    @prop() public isEnteredIntoStripe: boolean
}

export const ProductModel = new Product().getModelForClass(Product, timestamped)
