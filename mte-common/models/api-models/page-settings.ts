import { arrayProp, prop, MongooseDocument } from '../../lib/goosetype'

export class PageSettings extends MongooseDocument {
    @prop() public banner: string
    @prop() public bannerForeground: string
}
new PageSettings().getSchema()
