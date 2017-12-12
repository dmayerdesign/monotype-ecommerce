import * as findOrCreate from 'mongoose-findorcreate'
import { plugin, prop, MongooseDocument } from '../../utils/goosetype'

@plugin(findOrCreate)
export class Taxonomy extends MongooseDocument<Taxonomy> {
    @prop() public name: string
    @prop() public pluralName: string
    @prop() public slug: string
    @prop() public description: string
}

export const TaxonomyModel = new Taxonomy().getModel()
