import { ImageHelper } from '../../helpers/image.helper'
import { prop, MongooseDocument } from '../../lib/goosetype'

export class Image extends MongooseDocument {
    @prop({ get: ImageHelper.getImageForSchema }) public large?: string
    @prop({ get: ImageHelper.getImageForSchema }) public medium?: string
    @prop({ get: ImageHelper.getImageForSchema }) public thumbnail?: string
}
new Image().getSchemaWithGetters()
