import { Subject } from 'rxjs'

export abstract class Stateful<T> {
    protected abstract _state: T
    private _statePump = new Subject<T>()
    private _isSilent = false
    public states = this._statePump.asObservable()
    public onStateChange: (newState: T) => void

    public setState(newState: T): void {
        this._state = Object.assign({}, this._state, newState)
        if (!this._isSilent) {
            this._statePump.next(this._state)
            if (typeof this.onStateChange === 'function') {
                this.onStateChange(this._state)
            }
        }
    }

    public setStateSilently(newState: T): void {
        this.silence()
        this.setState(newState)
        this.unsilence()
    }

    public get state(): T {
        return this._state
    }

    private silence(): void {
        this._isSilent = true
    }

    private unsilence(): void {
        this._isSilent = false
    }
}
