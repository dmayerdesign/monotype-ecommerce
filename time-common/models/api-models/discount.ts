import { arrayProp, prop, Ref } from 'typegoose'
import { BaseApiModel } from './base-api-model'
import { Price } from './price'
import { Product } from './product'
import { TaxonomyTerm } from './taxonomy-term'

class DiscountExceptions {
    @arrayProp({ itemsRef: Product }) public products: Ref<Product>[]
    @arrayProp({ itemsRef: TaxonomyTerm }) public taxonomyTerms: Ref<TaxonomyTerm>[]
}

export class Discount extends BaseApiModel<Discount> {
    @prop() public code: string
    @prop() public amount: Price
    @prop() public percentage: number // `20` for a 20% discount
    @prop() public freeShipping: boolean
    @prop() public includes: DiscountExceptions
    @prop() public excludes: DiscountExceptions
}

export const DiscountModel = new Discount().getModelForClass(Discount)

export class CreateDiscountError extends Error { }
export class FindDiscountError extends Error { }
export class UpdateDiscountError extends Error { }
export class DeleteDiscountError extends Error { }
