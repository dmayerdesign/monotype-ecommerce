import { Ref } from '@mte/common/lib/goosetype/goosetype'
import { NavigationItem } from '@mte/common/models/api-models/navigation-item'
import { arrayProp, MongooseDocument, MongooseSchemaOptions } from '../../lib/goosetype'

export class UiContent extends MongooseDocument {
    @arrayProp({ itemsRef: NavigationItem }) public primaryNavigation: Ref<NavigationItem>[]
}
new UiContent().getSchema()
