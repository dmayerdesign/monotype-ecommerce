import * as findOrCreate from 'mongoose-findorcreate'
import { plugin, prop, Ref } from 'typegoose'

import { Attribute } from './attribute'
import { BaseApiModel } from './base-api-model'

@plugin(findOrCreate)
export class AttributeValue extends BaseApiModel<AttributeValue> {
    @prop({ ref: Attribute }) public attribute: Ref<Attribute>
    @prop() public name: string
    @prop() public slug: string
    @prop() public description: string
    @prop() public value: any
}

export const AttributeValueModel = new AttributeValue().getModelForClass(AttributeValue)

export class CreateAttributeValueError extends Error { }
export class FindAttributeValueError extends Error { }
export class UpdateAttributeValueError extends Error { }
export class DeleteAttributeValueError extends Error { }
