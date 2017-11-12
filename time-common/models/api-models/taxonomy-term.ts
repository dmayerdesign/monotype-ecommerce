import * as findOrCreate from 'mongoose-findorcreate'
import { arrayProp, plugin, prop, Ref } from 'typegoose'

import { Taxonomy } from './taxonomy'
import { TaxonomyTermSettings } from './taxonomy-term-settings'
import { TimeModel } from './time-model'

@plugin(findOrCreate)
export class TaxonomyTerm extends TimeModel {
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
