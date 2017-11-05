import * as findOrCreate from 'mongoose-findorcreate'
import { plugin, prop } from 'typegoose'

import { TimeModel } from './time-model'

@plugin(findOrCreate)
export class Attribute extends TimeModel {
    @prop() public name: string
    @prop() public pluralName: string
    @prop() public slug: string
    @prop() public description: string
}

export const AttributeModel = new Attribute().getModelForClass(Attribute)
