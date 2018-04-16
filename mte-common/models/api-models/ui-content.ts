import { arrayProp, prop, MongooseDocument, MongooseSchemaOptions, Ref } from '../../lib/goosetype'
import { CustomRegions } from './custom-regions'
import { NavigationItem } from './navigation-item'

export class UiContent extends MongooseDocument {
    @arrayProp({ itemsRef: NavigationItem }) public primaryNavigation: Ref<NavigationItem>[]
    @prop() public customRegions?: CustomRegions
}
new UiContent().getSchema()
