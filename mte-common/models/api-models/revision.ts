import { prop, MongooseDocument, MongooseSchemaOptions } from '../../lib/goosetype'

export class Revision extends MongooseDocument {
    @prop() public id: string
    @prop() public field: string
    @prop() public value: any
}

export const RevisionModel = new Revision().getModel(MongooseSchemaOptions.timestamped)

export class CreateRevisionError extends Error { }
export class FindRevisionError extends Error { }
export class UpdateRevisionError extends Error { }
export class DeleteRevisionError extends Error { }
