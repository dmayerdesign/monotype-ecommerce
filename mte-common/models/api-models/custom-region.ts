import { prop, MongooseDocument } from '../../lib/goosetype'

export class CustomRegion extends MongooseDocument {
    @prop() public className?: string
    @prop() public apiModel: string
    @prop() public dataProperty?: string
    @prop() public dataArrayProperty?: string
    @prop() public pathToDataArrayPropertyLookupKey?: string
    @prop() public dataArrayPropertyLookupValue?: string
    @prop() public pathToDataPropertyValue: string
}

new CustomRegion().getSchema()
