import * as findOrCreate from 'mongoose-findorcreate'
import { arrayProp, plugin, prop, InstanceType, Ref, Typegoose } from 'typegoose'

import { Taxonomy } from './taxonomy'
import { TaxonomyTermSettings } from './taxonomy-term-settings'

@plugin(findOrCreate)
export class TaxonomyTerm extends Typegoose {
    public static readonly findOrCreate: <T>(query: object) => Promise<{ doc: InstanceType<T>; created: boolean }>
    public _id?: string
    public createdAt?: Date
    public updatedAt?: Date
    public readonly save: () => Promise<InstanceType<TaxonomyTerm>>

    @prop({ ref: Taxonomy }) public taxonomy: Ref<Taxonomy>
    @prop() public name: string
    @prop() public pluralName: string
    @prop() public slug: string
    @prop() public description: string
    @prop({ ref: TaxonomyTerm }) public parent: Ref<TaxonomyTerm>
    @arrayProp({ itemsRef: TaxonomyTerm }) public children: Ref<TaxonomyTerm>[]

    @prop() public settings: TaxonomyTermSettings
}

export const TaxonomyTermModel = new TaxonomyTerm().getModelForClass(TaxonomyTerm)
