import { Type } from '@angular/core'
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { Action, Clear } from './action'
import { Effects } from './effects'
import { DomainEvent } from './event'
import { AsyncReducer, Reducer } from './reducer'

export class Store<StateType> {
    private _initialState: StateType
    private _statePump: BehaviorSubject<StateType>
    private _states: Observable<StateType>
    private _eventPump: ReplaySubject<DomainEvent<StateType>>
    private _events: Observable<DomainEvent<StateType>>
    private _incomingActions: Observable<Action>
    private _completedActions: Observable<Action>

    public reactTo: Effects = {
        oneOf: this._reactToOneOf.bind(this),
        allBut: this._reactToAllBut.bind(this),
    }

    public anticipate: Effects = {
        oneOf: this._anticipateOneOf.bind(this),
        allBut: this._anticipateAllBut.bind(this),
    }

    constructor(
        initialState: StateType,
        private _reducer: Reducer<StateType> | AsyncReducer<StateType>,
    ) {
        this._initialState = initialState
        this._statePump = new BehaviorSubject<StateType>(Object.assign({}, initialState))
        this._states = this._statePump.asObservable()
        this._eventPump = new ReplaySubject<DomainEvent<StateType>>(500)
        this._events = this._eventPump.asObservable()
        this._incomingActions = this._events.pipe(
            filter((domainEvent) => !domainEvent.completed),
            map((domainEvent) => domainEvent.action),
        )
        this._completedActions = this._events.pipe(
            filter((domainEvent) => domainEvent.completed),
            map((domainEvent) => domainEvent.action),
        )
    }

    // Workhorse methods.

    public async dispatch(action: Action): Promise<void> {

        // This block should be considered the source of truth for all event streams.

        // Get the current state.

        const beforeState = action instanceof Clear
            ? this._initialState
            : this._statePump.getValue()

        // Stream the action for anticipators to consume.

        this._eventPump.next({ state: beforeState, action, completed: false })

        // Create the new state.
        const afterStateOrPromise = this._reducer(Object.assign({}, beforeState), action)
        let afterState: StateType
        if (typeof((afterStateOrPromise as Promise<StateType>).then) === 'function') {
            afterState = await (afterStateOrPromise as Promise<StateType>)
        }
        else {
            afterState = afterStateOrPromise as StateType
        }

        this._statePump.next(afterState)
        this._eventPump.next({ state: afterState, action, completed: true })
    }

    private _reactToOneOf<ActionType extends Action = Action>(
        ...actionTypes: Type<ActionType>[]
    ): Observable<ActionType> {
        return this._completedActions.pipe(
            filter<ActionType>((action) => {
                if (actionTypes.length) {
                    return !!actionTypes.find((actionType) => action instanceof actionType)
                } else {
                    return false
                }
            })
        )
    }

    private _reactToAllBut<ActionType extends Action = Action>(
        ...actionTypes: Type<ActionType>[]
    ): Observable<ActionType> {
        return this._completedActions.pipe(
            filter<ActionType>((action) => {
                if (actionTypes.length) {
                    return !actionTypes.find((actionType) => action instanceof actionType)
                } else {
                    return true
                }
            })
        )
    }

    private _anticipateOneOf<ActionType extends Action = Action>(
        ...actionTypes: Type<ActionType>[]
    ): Observable<ActionType> {
        return this._incomingActions.pipe(
            filter<ActionType>((action) => {
                if (actionTypes.length) {
                    return !!actionTypes.find((actionType) => action instanceof actionType)
                } else {
                    return false
                }
            })
        )
    }

    private _anticipateAllBut<ActionType extends Action = Action>(
        ...actionTypes: Type<ActionType>[]
    ): Observable<ActionType> {
        return this._incomingActions.pipe(
            filter<ActionType>((action) => {
                if (actionTypes.length) {
                    return !actionTypes.find((actionType) => action instanceof actionType)
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

    public get events(): Observable<DomainEvent> {
        return this._events
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
