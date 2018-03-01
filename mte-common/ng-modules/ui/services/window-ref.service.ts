import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/mergeMap'
import { BootstrapBreakpoint } from '../../../models/enums/bootstrap-breakpoint'

export class WindowRefService {
    private _window = typeof window !== 'undefined' ? window : null
    public scrollPositionY: number
    public scrollPositionYs: Observable<number>
    private scrollPositionYPump: BehaviorSubject<number>
    public width: number
    public widths: Observable<number>
    private widthPump: BehaviorSubject<number>
    public height: number
    public heights: Observable<number>
    private heightPump: BehaviorSubject<number>

    constructor() {
        if (this._window) {
            this.scrollPositionYPump = new BehaviorSubject(this._window.scrollY)
            this.scrollPositionYs = this.scrollPositionYPump.asObservable()
            this.widthPump = new BehaviorSubject(this._window.innerWidth)
            this.widths = this.widthPump.asObservable()
            this.heightPump = new BehaviorSubject(this._window.innerHeight)
            this.heights = this.heightPump.asObservable()
        }
        else {
            this.scrollPositionYs = Observable.of(0)
            this.widths = Observable.of(1280)
            this.heights = Observable.of(720)
        }

        this.scrollPositionYs.subscribe((x) => this.scrollPositionY = x)
        this.widths.subscribe((x) => this.width = x)
        this.heights.subscribe((x) => this.height = x)

        if (this._window) {
            Observable
                .fromEvent(this._window, 'scroll')
                .map(() => this._window.scrollY)
                .subscribe((x) => this.scrollPositionYPump.next(x))

            Observable
                .fromEvent(this._window, 'resize')
                .map(() => this._window.innerWidth)
                .subscribe((x) => this.widthPump.next(x))

            Observable
                .fromEvent(this._window, 'resize')
                .map(() => this._window.innerHeight)
                .subscribe((x) => this.heightPump.next(x))

        }
    }

    private mediaBreakpoint(breakpoint: 'xs'|'sm'|'md'|'lg'|'xl', dir: 'above'|'below'): boolean {
        return dir === 'above'
            ? this.width >= BootstrapBreakpoint[breakpoint + 'Max']
            : this.width < BootstrapBreakpoint[breakpoint + 'Min']
    }

    public mediaBreakpointBelow(breakpoint: 'xs'|'sm'|'md'|'lg'|'xl'): boolean {
        return this.mediaBreakpoint(breakpoint, 'below')
    }

    public mediaBreakpointAbove(breakpoint: 'xs'|'sm'|'md'|'lg'|'xl'): boolean {
        return this.mediaBreakpoint(breakpoint, 'above')
    }

    public mediaBreakpoints(breakpoint: 'xs'|'sm'|'md'|'lg'|'xl', dir: 'above'|'below'): Observable<boolean> {
        return this.widths
            .map((width) => dir === 'above'
                ? width >= BootstrapBreakpoint[breakpoint + 'Max']
                : width < BootstrapBreakpoint[breakpoint + 'Min']
            )
    }

    public mediaBreakpointBelows(breakpoint: 'xs'|'sm'|'md'|'lg'|'xl'): Observable<boolean> {
        return this.mediaBreakpoints(breakpoint, 'below')
    }

    public mediaBreakpointAboves(breakpoint: 'xs'|'sm'|'md'|'lg'|'xl'): Observable<boolean> {
        return this.mediaBreakpoints(breakpoint, 'above')
    }
}
