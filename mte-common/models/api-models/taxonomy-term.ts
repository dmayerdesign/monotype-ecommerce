import * as findOrCreate from 'mongoose-findorcreate'

import { arrayProp, plugin, prop, MongooseDocument, Ref } from '../../lib/goosetype'
import { Attribute } from './attribute'
import { AttributeValue } from './attribute-value'
import { PageSettings } from './page-settings'
import { Taxonomy } from './taxonomy'

@plugin(findOrCreate)
export class TaxonomyTerm extends MongooseDocument {
    @prop({ ref: Taxonomy }) public taxonomy: Ref<Taxonomy>
    @prop() public singularName: string
    @prop() public pluralName: string
    @prop() public slug: string
    @prop() public description: string

    // Tree properties
    @prop({ ref: TaxonomyTerm }) public parent: Ref<TaxonomyTerm>
    @arrayProp({ itemsRef: TaxonomyTerm }) public children: Ref<TaxonomyTerm>[]

    // Defaults
    @arrayProp({ itemsRef: Attribute }) public defaultAttributes: Ref<Attribute>[]
    @arrayProp({ itemsRef: AttributeValue }) public defaultAttributeValues: Ref<AttributeValue>[]

    // Page settings
    @prop() public pageSettings: PageSettings
    @prop({ ref: Taxonomy }) public archiveGroupsTaxonomy: Ref<Taxonomy>
    @arrayProp({ itemsRef: TaxonomyTerm }) public archiveTermGroups: Ref<TaxonomyTerm>[]
}

export const TaxonomyTermModel = new TaxonomyTerm().getModel()
