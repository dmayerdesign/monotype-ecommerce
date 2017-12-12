import * as findOrCreate from 'mongoose-findorcreate'
import { plugin, prop, MongooseDocument } from '../../utils/goosetype'

import * as goosetype from '../../utils/goosetype'

@plugin(findOrCreate)
export class Attribute extends MongooseDocument<Attribute> {
    @prop() public name: string
    @prop() public pluralName: string
    @prop() public slug: string
    @prop() public description: string
}

export const AttributeModel = new Attribute().getModel()

export class CreateAttributeError extends Error { }
export class FindAttributeError extends Error { }
export class UpdateAttributeError extends Error { }
export class DeleteAttributeError extends Error { }
