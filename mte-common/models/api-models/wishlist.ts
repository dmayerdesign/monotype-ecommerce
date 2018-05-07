import { arrayProp, prop, MongooseDocument, MongooseSchemaOptions, Ref } from '../../lib/goosetype'
import { Product } from './product'

export class Wishlist extends MongooseDocument {
    @prop() public userId: string
    @arrayProp({ itemsRef: Product }) public products: Ref<Product>[]
}

export const WishlistModel = new Wishlist().getModel(MongooseSchemaOptions.timestamped)

// Errors.

export class CreateWishlistError extends Error { }
export class FindWishlistError extends Error { }
export class UpdateWishlistError extends Error { }
export class DeleteWishlistError extends Error { }
