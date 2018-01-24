export class MongoHelper {
    public static readonly AndOperation = { $and: [] }
}

export namespace MongoHelper {
    export interface AndOperation { $and: object[] }
}
