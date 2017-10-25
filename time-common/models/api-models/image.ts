import { prop } from 'typegoose'

export class Image {
    @prop() public large: string
    @prop() public medium: string
    @prop() public thumbnail: string
}
