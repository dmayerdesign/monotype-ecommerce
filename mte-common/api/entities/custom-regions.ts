import { arrayProp, schema, MongooseDocument } from '../../lib/goosetype'
import { CustomRegion } from './custom-region'

@schema(CustomRegions)
export class CustomRegions extends MongooseDocument {
    @arrayProp({ itemsType: CustomRegion }) public productDetailInfoHeader: CustomRegion[]
    @arrayProp({ itemsType: CustomRegion }) public productDetailMid: CustomRegion[]
}
