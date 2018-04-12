import { prop, MongooseDocument } from '../../lib/goosetype'
import { ShoppingCartIcons } from './shopping-cart-icons'

export class GlobalStyles extends MongooseDocument {
    @prop() public backgroundPatternImageSrc: string
    @prop() public shoppingCartIcons: ShoppingCartIcons
}
new GlobalStyles().getSchema()
