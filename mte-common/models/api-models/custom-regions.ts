import { arrayProp, schema, MongooseDocument } from '../../lib/goosetype'
import { CustomRegion } from './custom-region'

@schema(CustomRegions)
export class CustomRegions extends MongooseDocument {
    @arrayProp({ items: CustomRegion }) public productDetailInfoHeader: CustomRegion[]
    @arrayProp({ items: CustomRegion }) public productDetailMid: CustomRegion[]
}
