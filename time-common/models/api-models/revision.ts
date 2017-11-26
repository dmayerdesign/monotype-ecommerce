import { prop } from 'typegoose'

import { timestamped, BaseApiModel } from './base-api-model'

export class Revision extends BaseApiModel<Revision> {
    @prop() public id: string
    @prop() public field: string
    @prop() public value: any
}

export const RevisionModel = new Revision().getModelForClass(Revision, timestamped)
