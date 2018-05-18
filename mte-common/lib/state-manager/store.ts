import { BehaviorSubject, Observable, ReplaySubject, of as observableOf } from 'rxjs'
import { distinctUntilChanged, filter, map } from 'rxjs/operators'
import { Action } from './action'
import { Reducer } from './reducer'

export class Store<T> {
    private _previousState: T
    private _statePump: BehaviorSubject<T>
    private _states: Observable<T>
    private _reducers = new Map<string, T>()
    private _actionPump: ReplaySubject<Action>
    private _actions: Observable<Action>

    constructor(initialState: T, private reducer: Reducer<T>) {
        this._statePump = new BehaviorSubject<T>(Object.assign({}, initialState))
        this._states = this._statePump.asObservable()
        this._actionPump = new ReplaySubject<Action>(1)
        this._actions = this._actionPump.asObservable()
    }

    public dispatch(action: Action): Observable<boolean> {
        console.log(action)
        const currentState = this._statePump.getValue()
        try {
            const newState = this.reducer(Object.assign({}, currentState), action)
            this._statePump.next(newState)
            this._previousState = currentState
            this._actionPump.next(action)
            console.log(newState)
            return observableOf(true)
        }
        catch (failure) {
            return observableOf(false)
        }
    }

    public get states(): Observable<T> {
        return this._states
    }

    public get state(): T {
        return this._statePump.getValue()
    }

    public get previousState(): T {
        return this._previousState
    }

    public get actions(): Observable<Action> {
        return this._actions
    }

    public reactTo<A = Action>(action: A): Observable<Action> {
        return this._actions.pipe(filter((a) => a.constructor === action.constructor))
    }
}
