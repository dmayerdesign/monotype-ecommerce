import { plugin, prop } from 'typegoose'

import { TimeModel } from './time-model'

export class Timer extends TimeModel {
    @prop() public name: string
    @prop() public url: string
    @prop() public method: string
    @prop() public startedAt: number
    @prop() public duration: number
    @prop() public data: string
}

export const TimerModel = new Timer().getModelForClass(Timer, { schemaOptions: { timestamps: true } })
