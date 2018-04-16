import * as mongooseDelete from 'mongoose-delete'
import { arrayProp, plugin, pre, prop, MongooseDocument, MongooseSchemaOptions, Ref } from '../../lib/goosetype'

import { ImageHelper } from '../../helpers/image.helper'
import { ProductClass } from '../enums/product-class'
import { Attribute } from './attribute'
import { AttributeValue } from './attribute-value'
import { Dimensions } from './dimensions'
import { Image } from './image'
import { Price } from './price'
import { SimpleAttributeValue } from './simple-attribute-value'
import { TaxonomyTerm } from './taxonomy-term'
import { Units } from './units'

@pre('save', false, function(next) {
    const product = this
    if (!product.slug && product.isNew) {
        product.slug = product.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
    }
    if (product.slug && (product.isNew || product.isModified('slug'))) {
        product.slug = product.slug.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
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
@plugin(mongooseDelete)
export class Product extends MongooseDocument {
	// Aesthetic.
    @prop() public name: string
    @prop() public slug: string
    @prop() public description: string
    @arrayProp({ items: Image }) public featuredImages: Image[]
    @arrayProp({ items: Image }) public images: Image[]

	// Organizational.
    @prop({ unique: true }) public sku: string
    @prop({ enum: ProductClass }) public class: ProductClass
    @prop() public isStandalone: boolean
    @prop() public isParent: boolean

    // Financial.
    @prop() public price: Price
    @arrayProp({ items: Price }) public priceRange: Price[]
    @prop() public salePrice: Price
    @arrayProp({ items: Price }) public salePriceRange: Price[]
    @prop() public isOnSale: boolean
    @arrayProp({ items: String }) public variationSkus: string[]
    @arrayProp({ itemsRef: Product }) public variations: Ref<Product>[]
    @prop() public isVariation: boolean
    @prop() public isDefaultVariation: boolean
    @prop() public parentSku: string
    @prop({ ref: Product }) public parent: Ref<Product>

	// Attributes.
	// - Own attributes.
    @arrayProp({ itemsRef: AttributeValue }) public attributeValues: Ref<AttributeValue>[]
    @arrayProp({ items: SimpleAttributeValue }) public simpleAttributeValues: SimpleAttributeValue[]
	// - Variation attributes.
    @arrayProp({ itemsRef: Attribute }) public variableAttributes: Ref<Attribute>[]
    @arrayProp({ itemsRef: AttributeValue }) public variableAttributeValues: Ref<AttributeValue>[]

	// Taxonomy.
    @arrayProp({ itemsRef: TaxonomyTerm }) public taxonomyTerms: Ref<TaxonomyTerm>[]
    @arrayProp({ items: String }) public taxonomyTermSlugs: string[]

	// Shipping.
    @prop() public units: Units
    @prop() public dimensions: Dimensions
    @prop() public shippingWeight: number
    @prop() public netWeight: number

	// Additional tax.
    @prop() public additionalTax: number

	// Sales.
    @prop() public stockQuantity: number
    @prop() public totalSales: number
    @prop() public isEnteredIntoStripe: boolean
}

export const ProductModel = new Product().getModel()

export class CreateProductError extends Error { }
export class FindProductError extends Error { }
export class UpdateProductError extends Error { }
export class DeleteProductError extends Error { }
