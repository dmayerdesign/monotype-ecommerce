export abstract class Action<T = any> {
    public type?: any
    constructor(public payload: T) { }
}
