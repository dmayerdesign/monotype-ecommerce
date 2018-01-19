import * as findOrCreate from 'mongoose-findorcreate'

import { arrayProp, plugin, prop, MongooseDocument, Ref } from '../../lib/goosetype'
import { Taxonomy } from './taxonomy'
import { TaxonomyTermSettings } from './taxonomy-term-settings'

@plugin(findOrCreate)
export class TaxonomyTerm extends MongooseDocument<TaxonomyTerm> {
    @prop({ ref: Taxonomy }) public taxonomy: Ref<Taxonomy>
    @prop() public name: string
    @prop() public pluralName: string
    @prop() public slug: string
    @prop() public description: string
    @prop({ ref: TaxonomyTerm }) public parent: Ref<TaxonomyTerm>
    @arrayProp({ itemsRef: TaxonomyTerm }) public children: Ref<TaxonomyTerm>[]
    @prop() public settings: TaxonomyTermSettings
}

export const TaxonomyTermModel = new TaxonomyTerm().getModel()
