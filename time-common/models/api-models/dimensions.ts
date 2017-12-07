import { prop } from '../../utils/goosetype'

export class Dimensions {
    @prop() public length: number
    @prop() public width: number
    @prop() public height: number
}
