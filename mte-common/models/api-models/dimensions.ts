import { prop, MongooseDocument } from '../../lib/goosetype'

export class Dimensions extends MongooseDocument {
    @prop() public length: number
    @prop() public width: number
    @prop() public height: number
}
new Dimensions().getSchema()
