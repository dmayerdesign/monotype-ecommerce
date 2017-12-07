import { prop, Model, MongooseSchemaOptions } from '../../utils/goosetype'

export class Revision extends Model<Revision> {
    @prop() public id: string
    @prop() public field: string
    @prop() public value: any
}

export const RevisionModel = new Revision().getModel(MongooseSchemaOptions.Timestamped)
