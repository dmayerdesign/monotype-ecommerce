import { arrayProp, prop, Ref, Typegoose } from 'typegoose'
import { Price } from './price'
import { Product } from './product'
import { TaxonomyTerm } from './taxonomy-term'

class DiscountExceptions {
    @arrayProp({ itemsRef: Product }) public products: Ref<Product>[]
    @arrayProp({ itemsRef: TaxonomyTerm }) public terms: Ref<TaxonomyTerm>[]
}

export class Discount extends Typegoose {
    @prop() public code: string
    @prop() public amount: Price
    @prop() public percentage: number // `20` for a 20% discount
    @prop() public freeShipping: boolean
    @prop() public includes: DiscountExceptions
    @prop() public excludes: DiscountExceptions
}

export const DiscountModel = Discount
