import * as findOrCreate from 'mongoose-findorcreate'
import { plugin, prop, Typegoose } from 'typegoose'

@plugin(findOrCreate)
export class Attribute extends Typegoose {
    public static readonly findOrCreate: (query: object) => Promise<{ doc: Attribute; created: boolean }>
    public _id: string

    @prop() public name: string
    @prop() public pluralName: string
    @prop() public slug: string
    @prop() public description: string
}

export const AttributeModel = new Attribute().getModelForClass(Attribute)
