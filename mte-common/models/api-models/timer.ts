import { prop, MongooseDocument, MongooseSchemaOptions } from '../../lib/goosetype'

export class Timer extends MongooseDocument {
    @prop() public name: string
    @prop() public url: string
    @prop() public method: string
    @prop() public startedAt: number
    @prop() public duration: number
    @prop() public jsonData: string
}

export const TimerModel = new Timer().getModel(MongooseSchemaOptions.timestamped)
