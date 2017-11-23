import { prop } from 'typegoose'

import { timestamped, BaseApiModel } from './base-api-model'
import { MixedTypeValue } from './mixed-type-value'

export class Revision extends BaseApiModel<Revision> {
    @prop() public id: string
    @prop() public field: string
    @prop() public value: MixedTypeValue
}

export const RevisionModel = new Revision().getModelForClass(Revision, timestamped)

