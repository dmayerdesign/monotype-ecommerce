import * as findOrCreate from 'mongoose-findorcreate'
import { plugin, prop, Model } from '../../utils/goosetype'

@plugin(findOrCreate)
export class Taxonomy extends Model<Taxonomy> {
    @prop() public name: string
    @prop() public pluralName: string
    @prop() public slug: string
    @prop() public description: string
}

export const TaxonomyModel = new Taxonomy().getModel()
