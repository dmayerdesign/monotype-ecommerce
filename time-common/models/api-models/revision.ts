import { prop, Typegoose } from 'typegoose'

export class Revision extends Typegoose {
    @prop() public id: string
    @prop() public field: string
    @prop() public value: any
    @prop() public meta: any
}

export const RevisionModel = new Revision().getModelForClass(Revision, { schemaOptions: { timestamps: true } })

