import { forwardRef, AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { cloneDeep } from 'lodash'
import { fromEvent, merge, BehaviorSubject, Observable } from 'rxjs'
import { delay, filter, map, scan } from 'rxjs/operators'
import { HeartbeatComponent } from '../../../../heartbeat/heartbeat.component'
import { Heartbeat } from '../../../../heartbeat/heartbeat.decorator'

export enum RangeLimit {
    Min = 0,
    Max = 1,
}

@Component({
    selector: 'mte-range-slider',
    template: `
        <div class="range-slider-container">
            <div class="range-slider-inputs">
                <input #min
                    class="range-slider-input"
                    data-min
                    type="number"
                    [min]="getMinMin()"
                    [max]="getMinMax()"
                    [step]="displayStep"
                    [ngModel]="value[0]"
                    (change)="handleInputChange($event.target)"
                    (input)="handleInputChange($event.target)"
                />
                <input #max
                    class="range-slider-input"
                    data-max
                    type="number"
                    [min]="getMaxMin()"
                    [max]="getMaxMax()"
                    [step]="displayStep"
                    [ngModel]="value[1]"
                    (change)="handleInputChange($event.target)"
                    (input)="handleInputChange($event.target)"
                />
            </div>

            <div #track
                class="range-slider-track"
                [ngStyle]="{
                    backgroundColor: trackColor
                }">
            </div>

            <div #slider
                class="range-slider-knobs">

                <div #knobMin
                    data-knob-min
                    class="range-slider-knob range-slider-knob-min"
                    [ngStyle]="{
                        left: (minXPositions | async) + 'px',
                        backgroundColor: knobInnerColor,
                        borderColor: knobColor
                    }">
                    <div *ngIf="isMouseDownOnMin"
                        class="range-slider-knob-clicked">
                    </div>
                </div>

                <div #knobMax
                    data-knob-max
                    class="range-slider-knob range-slider-knob-max"
                    [ngStyle]="{
                        left: (maxXPositions | async) + 'px',
                        backgroundColor: knobInnerColor,
                        borderColor: knobColor
                    }">
                    <div *ngIf="isMouseDownOnMax"
                        class="range-slider-knob-clicked">
                    </div>
                </div>
            </div>
        </div>
    `,
    styleUrls: [ './mte-range-slider.component.scss' ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MteRangeSliderComponent),
            multi: true,
        },
    ],
})
@Heartbeat()
export class MteRangeSliderComponent extends HeartbeatComponent implements ControlValueAccessor, AfterViewInit, OnInit, OnDestroy {
    @Input() public step = 5
    @Input() public decimalPlaces: number
    @Input() public minLimit = 0
    @Input() public maxLimit = 100
    @Input() public knobColor = '#000'
    @Input() public knobInnerColor = '#fff'
    @Input() public trackColor = '#eee'
    @Output() public mouseUp = new EventEmitter<void>()
    @ViewChild('min') public min: ElementRef
    @ViewChild('max') public max: ElementRef
    @ViewChild('slider') public slider: ElementRef
    @ViewChild('knobMin') public knobMin: ElementRef
    @ViewChild('knobMax') public knobMax: ElementRef
    @ViewChild('knobMinDragging') public knobMinDragging: ElementRef
    @ViewChild('knobMaxDragging') public knobMaxDragging: ElementRef
    @ViewChild('track') public track: ElementRef
    public minXPositions: Observable<number>
    public maxXPositions: Observable<number>
    public isMouseDownOnMin = false
    public isMouseDownOnMax = false
    public rangeLimit = RangeLimit
    private _onChange: (value: any) => void
    private _value: number[] = [this.minLimit, this.maxLimit]
    private _lastMouseDownOffset: number
    private _modelChanges = new BehaviorSubject<number[]>(this.value)
    private _viewChanges = new BehaviorSubject<number[]>(this.value)

    constructor(
        private _renderer: Renderer2
    ) { super() }

    public ngOnInit(): void {
        this.minXPositions = merge(
            fromEvent(document, 'mousemove').pipe(
                filter(() => this.isMouseDownOnMin),
                map((event: MouseEvent) => {
                    const mouseOffset = this._lastMouseDownOffset - this.slider.nativeElement.offsetLeft
                    const offsetPx = mouseOffset
                    return event.clientX - offsetPx - this.slider.nativeElement.offsetLeft
                }),
                scan((accumulator, currentPosition) => {
                    const allowedValues = this._getAllowedValues()
                    const value = this._getLimitFromPosition(currentPosition)
                    const allowedValue = allowedValues.find((val) => value < val + 5 && value > val - 5)
                    if (allowedValue > this.value[1]) {
                        return accumulator
                    }
                    const newPosition = this._getPositionFromLimit(allowedValue)
                    if (allowedValue != null) {
                        accumulator = newPosition
                    }
                    return accumulator
                }),
            ),
            this._modelChanges.pipe(map((value) => this._getPositionFromLimit(value[0]))),
        )

        this.maxXPositions = merge(
            fromEvent(document, 'mousemove').pipe(
                filter(() => this.isMouseDownOnMax),
                map((event: MouseEvent) => {
                    const mouseOffset = this._lastMouseDownOffset - this.slider.nativeElement.offsetLeft
                    const offsetPx = mouseOffset
                    return event.clientX - offsetPx - this.slider.nativeElement.offsetLeft
                }),
                scan((accumulator, currentPosition) => {
                    const allowedValues = this._getAllowedValues()
                    const value = this._getLimitFromPosition(currentPosition)
                    const allowedValue = allowedValues.find((val) => value < val + 5 && value > val - 5)
                    if (allowedValue < this.value[0]) {
                        return accumulator
                    }
                    const newPosition = this._getPositionFromLimit(allowedValue)
                    if (allowedValue != null) {
                        accumulator = newPosition
                    }
                    return accumulator
                }),
            ),
            this._modelChanges.pipe(map((value) => this._getPositionFromLimit(value[1]))),
        )

        merge(
            this.minXPositions.pipe(map((minXPos) => this._getLimitFromPosition(minXPos))),
            this._modelChanges.pipe(map((value) => value[0])),
        )
            .pipe(delay(0))
            .subscribe((value) => {
                const newValue = [ ...this.value ]
                newValue[0] = value
                this.handleViewUpdate(newValue)
            })

        merge(
            this.maxXPositions.pipe(map((maxXPos) => this._getLimitFromPosition(maxXPos))),
            this._modelChanges.pipe(map((value) => value[1])),
        )
            .pipe(delay(0))
            .subscribe((value) => {
                const newValue = [ ...this.value ]
                newValue[1] = value
                this.handleViewUpdate(newValue)
            })
    }

    public ngOnDestroy(): void { }

    public ngAfterViewInit(): void {
        fromEvent<MouseEvent>(document, 'mousedown')
            .subscribe((event) => this._handleMouseDown(event))
        fromEvent<MouseEvent>(document, 'mouseup')
            .subscribe(() => this._handleMouseUp())
    }

    public get value(): number[] {
        return this._value
    }

    public get sliderWidth(): number {
        if (this.slider && this.slider.nativeElement) {
            return this.slider.nativeElement.offsetWidth
        }
        return 0
    }

    public get displayStep(): number {
        if (this.decimalPlaces != null) {
            return Math.pow(10, -this.decimalPlaces)
        }
        return this.step
    }

    public getMinMin(): number {
        return this.minLimit
    }
    public getMinMax(): number {
        return Math.min(this.maxLimit, this.value[1])
    }
    public getMaxMin(): number {
        return Math.max(this.minLimit, this.value[0])
    }
    public getMaxMax(): number {
        return this.maxLimit
    }

    // view -> model
    @HostListener('change', [ '$event.target' ])
    @HostListener('input', [ '$event.target' ])
    public handleInputChange(inputElement: any): void {
        const newValue = cloneDeep(this._value)
        const indexOfRangeLimit = inputElement.hasAttribute('data-min') ? RangeLimit.Min
            : inputElement.hasAttribute('data-max') ? RangeLimit.Max
            : null
        const inputValue = Array.isArray(inputElement.value)
            ? inputElement.value[indexOfRangeLimit]
            : inputElement.value

        newValue[indexOfRangeLimit] = parseFloat(inputValue)
        if (newValue[0] <= newValue[1]) {
            this.handleViewUpdate(newValue)

            if (inputElement.hasAttribute('data-min')) {
                this.knobMin.nativeElement.style.left = `${this._getPositionFromLimit(newValue[RangeLimit.Min])}px`
            }
            if (inputElement.hasAttribute('data-max')) {
                this.knobMax.nativeElement.style.left = `${this._getPositionFromLimit(newValue[RangeLimit.Max])}px`
            }
        }
    }

    public handleViewUpdate(newValue: number[]): void {
        if (newValue[0] <= newValue[1]) {
            newValue = newValue.map((x) => Math.floor(x))
            this._value = newValue
            this._onChange(this.value)
            this._viewChanges.next(this.value)
        }
    }

    // model -> view
    public writeValue(value: number[]): void {
        let min: number
        let max: number

        if (!!value && !Array.isArray(value)) {
            console.warn('Attempted to write a non-array value to the range slider.')
            return
        }
        else if (!!value && value.length > 2) {
            console.warn('The value supplied to the range slider was an array with more than 2 elements.')
        }
        else if (!value || value.length < 2) {
            return
        }

        min = value[0]
        max = value[1]

        if (typeof min !== 'number') {
            if (min === '') {
                min = 0
            }
            else {
                min = parseFloat(min)
                if (isNaN(min)) {
                    throw new Error('The range minimum could not be parsed as a number.')
                }
            }
        }
        if (typeof max !== 'number') {
            if (max === '') {
                max = 0
            }
            else {
                max = parseFloat(max)
                if (isNaN(max)) {
                    throw new Error('The range maximum could not be parsed as a number.')
                }
            }
        }

        if (min <= max) {
            this._value = value.map((x) => Math.floor(x))
            this._renderer.setValue(this.min.nativeElement, `${min}`)
            this._renderer.setValue(this.max.nativeElement, `${max}`)
            this._modelChanges.next(this.value)
        }
    }

    private _handleMouseDown(event: MouseEvent): void {
        const knob = this._findNearestElementWithAttribute(event.target, 'data-knob-min')
            || this._findNearestElementWithAttribute(event.target, 'data-knob-max')

        if (knob) {
            this._lastMouseDownOffset = event.clientX - knob.offsetLeft
            if (knob.hasAttribute('data-knob-min')) {
                this.isMouseDownOnMin = true
            }
            else if (knob.hasAttribute('data-knob-max')) {
                this.isMouseDownOnMax = true
            }
        }
    }

    private _handleMouseUp(): void {
        if (this.isMouseDownOnMin || this.isMouseDownOnMax) {
            this.mouseUp.emit()
        }
        this.isMouseDownOnMin = false
        this.isMouseDownOnMax = false
    }

    private _getLimitFromPosition(position: number): number {
        let limit = 0
        if (this.sliderWidth) {
            const fraction = position / this.sliderWidth
            limit = this.minLimit + ((this.maxLimit - this.minLimit) * fraction)
        }
        return limit
    }

    private _getPositionFromLimit(limit: number): number {
        let position = 0
        if (limit < this.minLimit) {
            return this.minLimit
        }
        if (limit > this.maxLimit) {
            return this.maxLimit
        }
        if (this.sliderWidth) {
            const fraction = (limit - this.minLimit) / (this.maxLimit - this.minLimit)
            position = this.sliderWidth * fraction
        }
        return position
    }

    private _getAllowedValues(): number[] {
        const self = this
        return Array.from(
            (function*() {
                for (let x = self.minLimit; x <= self.maxLimit; x++) {
                    if (x % self.step === 0) {
                        yield x
                    }
                }
            }())
        )
    }

    public registerOnChange(onChangeFn: (value: any) => void): void {
        this._onChange = onChangeFn
    }
    public registerOnTouched(_onTouchedFn: any): void { }

    private _findNearestElementWithAttribute(element: any, attribute: string): any {
        let i = 0
        const _findNearestElementWithAttribute = (_element: any, _attribute: string) => {
            i++
            if (i < 5) {
                if (_element.hasAttribute(_attribute)) {
                    return _element
                } else if (!!_element.parentElement) {
                    return this._findNearestElementWithAttribute(_element.parentElement, _attribute)
                } else {
                    return null
                }
            }
            return null
        }
        return _findNearestElementWithAttribute(element, attribute)
    }
}
