import * as findOrCreate from 'mongoose-findorcreate'
import { plugin, prop, InstanceType, Typegoose } from 'typegoose'

@plugin(findOrCreate)
export class Taxonomy extends Typegoose {
    public static readonly findOrCreate: <T>(query: object) => Promise<{ doc: InstanceType<T>; created: boolean }>
    public _id?: string
    public createdAt?: Date
    public updatedAt?: Date
    public readonly save: () => Promise<InstanceType<Taxonomy>>

    @prop() public name: string
    @prop() public pluralName: string
    @prop() public slug: string
    @prop() public description: string
}

export const TaxonomyModel = new Taxonomy().getModelForClass(Taxonomy)
