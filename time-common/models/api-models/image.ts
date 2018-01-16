import { prop } from '../../lib/goosetype'

export class Image {
    @prop() public large: string
    @prop() public medium: string
    @prop() public thumbnail: string
}
