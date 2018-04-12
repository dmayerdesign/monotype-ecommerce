import * as findOrCreate from 'mongoose-findorcreate'
import { plugin, prop, MongooseDocument } from '../../lib/goosetype'

@plugin(findOrCreate)
export class Taxonomy extends MongooseDocument {
    @prop() public singularName: string
    @prop() public pluralName: string
    @prop() public slug: string
    @prop() public description: string
}

export const TaxonomyModel = new Taxonomy().getModel()

export class CreateTaxonomyError extends Error { }
export class FindTaxonomyError extends Error { }
export class UpdateTaxonomyError extends Error { }
export class DeleteTaxonomyError extends Error { }
