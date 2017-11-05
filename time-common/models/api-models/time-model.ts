import { Typegoose } from 'typegoose'

export class TimeModel extends Typegoose {
    public static readonly findOrCreate: <T>(query: object) => Promise<{ doc: T; created: boolean }>

    public _id?: string
    public createdAt?: Date
    public updatedAt?: Date
}

export const timestamped = {
    schemaOptions: { timestamps: true }
}
