import { arrayProp, prop, MongooseDocument, Ref } from '../../utils/goosetype'
import { Price } from './price'
import { Product } from './product'
import { TaxonomyTerm } from './taxonomy-term'

class DiscountExceptions {
    @arrayProp({ itemsRef: Product }) public products: Ref<Product>[]
    @arrayProp({ itemsRef: TaxonomyTerm }) public taxonomyTerms: Ref<TaxonomyTerm>[]
}

export class Discount extends MongooseDocument<Discount> {
    @prop() public code: string
    @prop() public amount: Price
    @prop() public percentage: number // `20` for a 20% discount
    @prop() public freeShipping: boolean
    @prop() public includes: DiscountExceptions
    @prop() public excludes: DiscountExceptions
}

export const DiscountModel = new Discount().getModel()

export class CreateDiscountError extends Error { }
export class FindDiscountError extends Error { }
export class UpdateDiscountError extends Error { }
export class DeleteDiscountError extends Error { }
