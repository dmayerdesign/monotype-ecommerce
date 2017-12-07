import * as findOrCreate from 'mongoose-findorcreate'

import { plugin, prop, Model, Ref } from '../../utils/goosetype'
import { Attribute } from './attribute'

@plugin(findOrCreate)
export class AttributeValue extends Model<AttributeValue> {
    @prop({ ref: Attribute }) public attribute: Ref<Attribute>
    @prop() public name: string
    @prop() public slug: string
    @prop() public description: string
    @prop() public value: any
}

export const AttributeValueModel = new AttributeValue().getModel()

export class CreateAttributeValueError extends Error { }
export class FindAttributeValueError extends Error { }
export class UpdateAttributeValueError extends Error { }
export class DeleteAttributeValueError extends Error { }
