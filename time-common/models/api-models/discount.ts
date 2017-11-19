import { arrayProp, prop, Ref } from 'typegoose'
import { Price } from './price'
import { Product } from './product'
import { TaxonomyTerm } from './taxonomy-term'
import { TimeModel } from './time-model'

class DiscountExceptions {
    @arrayProp({ itemsRef: Product }) public products: Ref<Product>[]
    @arrayProp({ itemsRef: TaxonomyTerm }) public taxonomyTerms: Ref<TaxonomyTerm>[]
}

export class Discount extends TimeModel {
    @prop() public code: string
    @prop() public amount: Price
    @prop() public percentage: number // `20` for a 20% discount
    @prop() public freeShipping: boolean
    @prop() public includes: DiscountExceptions
    @prop() public excludes: DiscountExceptions
}

export const DiscountModel = new Discount().getModelForClass(Discount)
