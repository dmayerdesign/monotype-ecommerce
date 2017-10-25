import { arrayProp, Ref } from 'typegoose'

import { Attribute } from './attribute'

export class TaxonomyTermSettings {
    @arrayProp({ itemsRef: Attribute }) public attributes: Ref<Attribute>[]
    @arrayProp({ itemsRef: Attribute }) public variableAttributes: Ref<Attribute>[]
}
