import { Action } from '@ngrx/store'

export abstract class NgrxAction<PayloadType = any> implements Action {
    public abstract type: string
    constructor(
        public payload?: PayloadType
    ) { }
}
