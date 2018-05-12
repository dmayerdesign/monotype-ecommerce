import { ImageHelper } from '../../helpers/image.helper'
import { prop, schema, MongooseDocument } from '../../lib/goosetype'

@schema(Image)
export class Image extends MongooseDocument {
    @prop({ get: ImageHelper.getImageForSchema }) public large?: string
    @prop({ get: ImageHelper.getImageForSchema }) public medium?: string
    @prop({ get: ImageHelper.getImageForSchema }) public thumbnail?: string
}
