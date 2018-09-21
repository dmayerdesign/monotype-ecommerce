import { Action } from './action'

export class SourceEvent<StateType = any> {
    public beforeState: StateType
    public action: Action<StateType>
    public afterState?: StateType
    public asyncBefore?: boolean
    public asyncAfter?: boolean

    constructor({ beforeState, action, afterState }: SourceEvent) {
        this.beforeState = beforeState
        this.action = action
        this.afterState = afterState
    }
}
