import { prop, MongooseDocument } from '../../lib/goosetype'

export class GlobalStyles extends MongooseDocument {
    @prop() public backgroundPatternImageSrc: string
}
new GlobalStyles().getSchema()
