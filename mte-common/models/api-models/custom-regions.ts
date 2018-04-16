import { arrayProp, MongooseDocument } from '../../lib/goosetype'
import { CustomRegion } from './custom-region'

export class CustomRegions extends MongooseDocument {
    @arrayProp({ items: CustomRegion }) public productDetailInfoHeader: CustomRegion[]
}

new CustomRegions().getSchema()
