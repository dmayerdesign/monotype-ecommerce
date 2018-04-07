import { Attribute } from '../../api-models/attribute'
import { AttributeValue } from '../../api-models/attribute-value'

export type GetAttributeSelectOptionsResponseBody = { attribute: Attribute, attributeValues: AttributeValue[] }[]
