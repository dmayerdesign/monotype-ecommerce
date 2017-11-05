import * as findOrCreate from 'mongoose-findorcreate'
import { plugin, prop, Ref } from 'typegoose'

import { Attribute } from './attribute'
import { TimeModel } from './time-model'

@plugin(findOrCreate)
export class AttributeValue extends TimeModel {
    @prop({ ref: Attribute }) public attribute: Ref<Attribute>
    @prop() public name: string
    @prop() public slug: string
    @prop() public description: string
    @prop() public value: any
}

export const AttributeValueModel = new AttributeValue().getModelForClass(AttributeValue)
