import { Type } from '@angular/core'
import { of as observableOf, BehaviorSubject, Observable, ReplaySubject } from 'rxjs'
import { filter } from 'rxjs/operators'
import { Action } from './action'
import { Reducer } from './reducer'

export class Store<StateType> {
    private _statePump: BehaviorSubject<StateType>
    private _states: Observable<StateType>
    private _incomingActionPump: ReplaySubject<Action>
    private _incomingActions: Observable<Action>
    private _completedActionPump: ReplaySubject<Action>
    private _completedActions: Observable<Action>
    private _history: { action: Action, state: StateType }[] = []
    private _future: { action: Action, state: StateType }[] = []

    constructor(initialState: StateType, private _reducer: Reducer<StateType>, private _historyMaxLength = 5) {
        this._statePump = new BehaviorSubject<StateType>(Object.assign({}, initialState))
        this._states = this._statePump.asObservable()
        this._incomingActionPump = new ReplaySubject<Action>(1)
        this._incomingActions = this._incomingActionPump.asObservable()
        this._completedActionPump = new ReplaySubject<Action>(1)
        this._completedActions = this._completedActionPump.asObservable()
        this._history.push({
            action: null,
            state: initialState,
        })
    }

    public dispatch(action: Action): Observable<boolean> {
        const currentState = this._statePump.getValue()
        try {
            const newState = this._reducer(Object.assign({}, currentState), action)
            this._incomingActionPump.next(action)
            this._statePump.next(newState)
            this._completedActionPump.next(action)
            this._history.push({ action, state: newState })
            if (this._history.length > this._historyMaxLength) {
                this._history.splice(0, 1)
            }
            return observableOf(true)
        }
        catch (failure) {
            console.error(failure)
            return observableOf(false)
        }
    }

    public reactTo<ActionType extends Action = Action>(...actionTypes: Type<ActionType>[]): Observable<ActionType> {
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

    /** Experimental */
    public stepBackward(times = 1): Observable<boolean> {
        if (this._history.length >= times) {
            for (let i = 0; i < times; i++) {
                if (i === times - 1) {
                    const { action, state } = this._history[this._history.length - 1]
                    this._incomingActionPump.next(action)
                    this._statePump.next(state)
                    this._completedActionPump.next(action)
                }
                this._future.push(this._history.pop())
            }
            console.log(this._history, this._future)
            return observableOf(true)
        }
        return observableOf(false)
    }

    /** Experimental */
    public stepForward(): Observable<boolean> {
        if (this._future.length > 0) {
            const { action, state } = this._future[this._future.length - 1]
            this._incomingActionPump.next(action)
            this._statePump.next(state)
            this._completedActionPump.next(action)
            this._history.push(this._future.pop())
            return observableOf(true)
        }
        return observableOf(false)
    }

    /** Experimental */
    public redoPreviousAction(): Observable<boolean> {
        if (this._history.length > 0) {
            const { action } = this._history[this._history.length - 1]
            return this.dispatch(action)
        }
        return observableOf(false)
    }

    /** Experimental */
    public doNextAction(): Observable<boolean> {
        if (this._future.length > 0) {
            const { action } = this._future[this._future.length - 1]
            return this.dispatch(action)
        }
        return observableOf(false)
    }

    public get states(): Observable<StateType> {
        return this._states
    }

    public get state(): StateType {
        return this._statePump.getValue()
    }

    public get previousState(): StateType {
        if (history.length > 0) {
            const previousHistoryItem = this._history[this._history.length - 1]
            return previousHistoryItem.state
        }
        return undefined
    }

    public get actions(): Observable<Action> {
        return this._incomingActions
    }

    public get incomingActions(): Observable<Action> {
        return this.actions
    }

    public get completedActions(): Observable<Action> {
        return this._completedActions
    }
}
