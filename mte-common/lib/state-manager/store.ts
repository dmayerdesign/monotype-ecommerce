import { Type } from '@angular/core'
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs'
import { filter } from 'rxjs/operators'
import { Action, Clear } from './action'
import { SourceEvent } from './event'
import { AsyncReducer, Reducer } from './reducer'

export class Store<StateType> {
    private _statePump: BehaviorSubject<StateType>
    private _eventSource = new ReplaySubject<SourceEvent<StateType>>(null)
    private _states: Observable<StateType>
    private _initialState: StateType
    private _incomingActionPump: ReplaySubject<Action>
    private _incomingActions: Observable<Action>
    private _completedActionPump: ReplaySubject<Action>
    private _completedActions: Observable<Action>

    constructor(initialState: StateType, private _reducer: Reducer<StateType> | AsyncReducer<StateType>) {
        this._initialState = initialState
        this._statePump = new BehaviorSubject<StateType>(Object.assign({}, initialState))
        this._states = this._statePump.asObservable()
        this._incomingActionPump = new ReplaySubject<Action>(1)
        this._incomingActions = this._incomingActionPump.asObservable()
        this._completedActionPump = new ReplaySubject<Action>(1)
        this._completedActions = this._completedActionPump.asObservable()
    }

    // Workhorse methods.

    public async dispatch(action: Action): Promise<void> {

        // This block should be considered the source of truth for all event streams.

        const beforeState = action instanceof Clear
            ? this._initialState
            : this._statePump.getValue()
        this._incomingActionPump.next(action)
        this._eventSource.next({ beforeState, action, asyncBefore: true })
        let afterState = this._reducer(Object.assign({}, beforeState), action)
        if (afterState instanceof Promise) {
            afterState = await afterState
        }
        this._eventSource.next({ beforeState, action, afterState, asyncAfter: true })
        this._statePump.next(afterState)
        this._completedActionPump.next(action)
    }

    public reactTo<ActionType extends Action = Action>(
        ...actionTypes: Type<ActionType>[]
    ): Observable<ActionType> {
        return this._completedActions.pipe(
            filter<ActionType>((action) => {
                if (actionTypes.length) {
                    return !!actionTypes.find((actionType) => action instanceof actionType)
                } else {
                    return true
                }
            })
        )
    }

    public anticipate<ActionType extends Action = Action>(...actionTypes: Type<ActionType>[]): Observable<ActionType> {
        return this._incomingActions.pipe(
            filter<ActionType>((action) => {
                if (actionTypes.length) {
                    return !!actionTypes.find((actionType) => action instanceof actionType)
                } else {
                    return true
                }
            })
        )
    }

    public clear(): void {
        this.dispatch(new Clear())
    }

    // Getters.

    public get states(): Observable<StateType> {
        return this._states
    }

    public get state(): StateType {
        return this._statePump.getValue()
    }

    public get actions(): Observable<Action> {
        return this.incomingActions
    }

    public get incomingActions(): Observable<Action> {
        return this._incomingActions
    }

    public get completedActions(): Observable<Action> {
        return this._completedActions
    }
}
