import * as findOrCreate from 'mongoose-findorcreate'
import { plugin, prop } from 'typegoose'
import { BaseApiModel } from './base-api-model'

@plugin(findOrCreate)
export class Attribute extends BaseApiModel<Attribute> {
    @prop() public name: string
    @prop() public pluralName: string
    @prop() public slug: string
    @prop() public description: string
}

export const AttributeModel = new Attribute().getModelForClass(Attribute)

export class CreateAttributeError extends Error { }
export class FindAttributeError extends Error { }
export class UpdateAttributeError extends Error { }
export class DeleteAttributeError extends Error { }
