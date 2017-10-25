import * as findOrCreate from 'mongoose-findorcreate'
import { plugin, prop, Typegoose } from 'typegoose'

@plugin(findOrCreate)
export class Taxonomy extends Typegoose {
    public static readonly findOrCreate: (query: object) => Promise<{ doc: Taxonomy; created: boolean }>
    public _id: string

    @prop() public name: string
    @prop() public pluralName: string
    @prop() public slug: string
    @prop() public description: string
}

export const TaxonomyModel = new Taxonomy().getModelForClass(Taxonomy)
