import * as findOrCreate from 'mongoose-findorcreate'
import { plugin, prop } from 'typegoose'

import { TimeModel } from './time-model'

@plugin(findOrCreate)
export class Taxonomy extends TimeModel {
    @prop() public name: string
    @prop() public pluralName: string
    @prop() public slug: string
    @prop() public description: string
}

export const TaxonomyModel = new Taxonomy().getModelForClass(Taxonomy)
