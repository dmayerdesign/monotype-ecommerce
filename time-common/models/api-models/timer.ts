import { prop, InstanceType } from 'typegoose'

import { timestamped, BaseApiModel } from './base-api-model'

export class Timer extends BaseApiModel<Timer> {
    public static readonly findOrCreate: <T>(query: object) => Promise<{ doc: InstanceType<T>; created: boolean }>
    public _id?: string
    public createdAt?: Date
    public updatedAt?: Date
    public readonly save: () => Promise<InstanceType<Timer>>

    @prop() public name: string
    @prop() public url: string
    @prop() public method: string
    @prop() public startedAt: number
    @prop() public duration: number
    @prop() public jsonData: string
}

export const TimerModel = new Timer().getModelForClass(Timer, timestamped)
