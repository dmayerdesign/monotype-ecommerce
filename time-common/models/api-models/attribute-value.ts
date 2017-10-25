import * as findOrCreate from 'mongoose-findorcreate'
import { plugin, prop, Ref, Typegoose } from 'typegoose'

import { Attribute } from './attribute'

@plugin(findOrCreate)
export class AttributeValue extends Typegoose {
    public static readonly findOrCreate: (query: object) => Promise<{ doc: AttributeValue; created: boolean }>
    public _id: string

    @prop({ ref: Attribute }) public attribute: Ref<Attribute>
    @prop() public name: string
    @prop() public slug: string
    @prop() public description: string
    @prop() public value: any
}

export const AttributeValueModel = new AttributeValue().getModelForClass(AttributeValue)
