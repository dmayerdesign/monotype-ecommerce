import { arrayProp, MongooseDocument, Ref } from '../../lib/goosetype'

import { Attribute } from './attribute'

export class TaxonomyTermSettings extends MongooseDocument<TaxonomyTermSettings> {
    @arrayProp({ itemsRef: Attribute }) public attributes: Ref<Attribute>[]
    @arrayProp({ itemsRef: Attribute }) public variableAttributes: Ref<Attribute>[]
}
new TaxonomyTermSettings().getSchema()
