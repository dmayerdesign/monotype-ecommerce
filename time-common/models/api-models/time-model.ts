import { InstanceType, Typegoose } from 'typegoose'

export class TimeModel<T = any> extends Typegoose {
    public static readonly findOrCreate: <T>(query: object) => Promise<{ doc: InstanceType<T>; created: boolean }>

    public _id?: string
    public createdAt?: Date
    public updatedAt?: Date

    public readonly save: () => Promise<InstanceType<T>>
}

export const timestamped = {
    schemaOptions: { timestamps: true }
}
