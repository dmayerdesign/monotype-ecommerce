import { prop, MongooseDocument, MongooseSchemaOptions } from '../../lib/goosetype'

export class Revision extends MongooseDocument<Revision> {
    @prop() public id: string
    @prop() public field: string
    @prop() public value: any
}

export const RevisionModel = new Revision().getModel(MongooseSchemaOptions.Timestamped)
