import { prop } from 'typegoose'

export class MixedTypeValue {
    @prop() public string?: string
    @prop() public number?: number
    @prop() public boolean?: boolean
}
