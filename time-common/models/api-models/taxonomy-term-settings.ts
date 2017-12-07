import { arrayProp, Ref } from '../../utils/goosetype'

import { Attribute } from './attribute'

export class TaxonomyTermSettings {
    @arrayProp({ itemsRef: Attribute }) public attributes: Ref<Attribute>[]
    @arrayProp({ itemsRef: Attribute }) public variableAttributes: Ref<Attribute>[]
}
