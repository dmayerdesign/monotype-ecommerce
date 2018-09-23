export abstract class Action<T = any> {
    public description?: any
    constructor(public payload: T) { }
}

export class Clear extends Action {
    constructor(public payload = null) {
        super(payload)
    }
}
