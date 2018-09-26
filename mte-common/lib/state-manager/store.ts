import { Type } from '@angular/core'
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { Action, Clear } from './action'
import { Effects } from './effects'
import { DomainEvent } from './event'
import { AsyncReducer, Reducer } from './reducer'

export class Store<StateType, ActionType extends Action = Action> {
    private _initialState: StateType
    private _statePump: BehaviorSubject<StateType>
    private _states: Observable<StateType>
    private _eventPump: ReplaySubject<DomainEvent<StateType>>
    private _events: Observable<DomainEvent<StateType>>
    private _incomingActions: Observable<Action>
    private _completedActions: Observable<Action>

    /**
     * Using either the `oneOf` or `allBut` methods, create a stream of anticipated actions.
     * @property {Effect} oneOf Anticipate actions that are instances of any of the action constructors you pass in.
     * @property {Effect} allBut Anticipate all actions except for those that are instances of the action constructors you pass in.
     */
    public anticipate: Effects = {
        oneOf: (...actionTypes: Type<ActionType>[]) => this._incomingActions.pipe(
            filter<ActionType>((action) => {
                if (actionTypes.length) {
                    return !!actionTypes.find((actionType) => action instanceof actionType)
                } else {
                    return false
                }
            })
        ),
        allBut: (...actionTypes: Type<ActionType>[]) => this._incomingActions.pipe(
            filter<ActionType>((action) => {
                if (actionTypes.length) {
                    return !actionTypes.find((actionType) => action instanceof actionType)
                } else {
                    return true
                }
            })
        )
    }

    /**
     * Using either the `oneOf` or `allBut` methods, create a stream of completed actions.
     * @property {Effect} oneOf React to actions that are instances of any of the action constructors you pass in.
     * @property {Effect} allBut React to all actions except for those that are instances of the action constructors you pass in.
     */
    public reactTo: Effects<ActionType> = {
        oneOf: (...actionTypes: Type<ActionType>[]) => this._completedActions.pipe(
            filter<ActionType>((action) => {
                if (actionTypes.length) {
                    return !!actionTypes.find((actionType) => action instanceof actionType)
                } else {
                    return false
                }
            })
        ),
        allBut: (...actionTypes: Type<ActionType>[]) => this._completedActions.pipe(
            filter<ActionType>((action) => {
                if (actionTypes.length) {
                    return !actionTypes.find((actionType) => action instanceof actionType)
                } else {
                    return true
                }
            })
        )
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

    /**
     * Dispatch an Action to be consumed by the registered reducer function.
     * @param {Action} action An instance of (a subclass of) Action, representing some event taking
     * place in the UI.
     */
    public dispatch(action: ActionType | Clear): void {
        this._dispatch(action)
    }

    /**
     * Dispatch a new Clear action, which resets the store to its initial state while preserving
     * the event source.
     */
    public clear(): void {
        this.dispatch(new Clear())
    }

    // Getters.

    /** Get the store's current state. */
    public get state(): StateType {
        return this._statePump.getValue()
    }

    public get states(): Observable<StateType> {
        return this._states
    }

    public get events(): Observable<DomainEvent> {
        return this._events
    }

    public get incomingActions(): Observable<Action> {
        return this._incomingActions
    }

    public get completedActions(): Observable<Action> {
        return this._completedActions
    }

    // Logic.

    /** This method acts as the source of truth for all the Store's event streams. */
    private async _dispatch(action: ActionType | Clear): Promise<void> {

        // Get the current state.
        const beforeState = action instanceof Clear
            ? this._initialState
            : this._statePump.getValue()

        // Stream the action for anticipators to consume.
        this._eventPump.next({
            action,
            state: beforeState,
            completed: false,
        })

        // Create the new state.
        const afterStateOrPromise = this._reducer(Object.assign({}, beforeState), action)
        let afterState: StateType
        if (typeof((afterStateOrPromise as Promise<StateType>).then) === 'function') {
            afterState = await (afterStateOrPromise as Promise<StateType>)
        }
        else {
            afterState = afterStateOrPromise as StateType
        }

        // Publish the new state.
        this._statePump.next(afterState)
        this._eventPump.next({
            action,
            state: afterState,
            completed: true,
        })
    }
}
