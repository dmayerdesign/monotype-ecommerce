import { prop, Model, MongooseSchemaOptions } from '../../utils/goosetype'

export class Timer extends Model<Timer> {
    @prop() public name: string
    @prop() public url: string
    @prop() public method: string
    @prop() public startedAt: number
    @prop() public duration: number
    @prop() public jsonData: string
}

export const TimerModel = new Timer().getModel(MongooseSchemaOptions.Timestamped)
