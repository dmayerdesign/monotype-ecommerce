import { prop, MongooseDocument, Ref } from '../../lib/goosetype'
import { Attribute } from './attribute'

export class SimpleAttributeValue extends MongooseDocument {
    @prop({ ref: Attribute }) public attribute: Ref<Attribute>
    @prop() public value: any
}

new SimpleAttributeValue().getSchema()
