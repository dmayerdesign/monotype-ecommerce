import { prop, MongooseDocument } from '../../lib/goosetype'

export class Image extends MongooseDocument {
    @prop() public large?: string
    @prop() public medium?: string
    @prop() public thumbnail?: string
}
new Image().getSchema()
