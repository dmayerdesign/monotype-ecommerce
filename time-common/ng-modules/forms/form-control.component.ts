import { forwardRef, ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
} from '@angular/forms'

import { ErrorsMap } from './form.models'

@Component({
    selector: 'time-form-control',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TimeFormControlComponent),
            multi: true,
        },
    ],
})
export class TimeFormControlComponent implements ControlValueAccessor, OnInit {
    @Input() public autoWidth = false
    @Input() public class = ''
    @Input() public disabled: undefined|true
    @Input() public errorMessages: ErrorsMap
    @Input() public hideLabel = false
    @Input() public id = ''
    @Input() public inputClassName = ''
    @Input() public label = ''
    @Input() public labelClassName = ''
    @Input() public maxLength = 1000
    @Input() public name = ''
    @Input() public placeholder = ''
    @Input() public tooltip: string
    @Input() public type = ''

    public errMessages: ErrorsMap
    public describedby: string
    public value: any

    private propagateChange = (_: any) => { }
    private propagateTouch = () => { }

    public ngOnInit() {
        const defaultErrorMessages: ErrorsMap = {
            required: this.label + " is required",
            email: "Invalid email"
        }
        this.errMessages = {
            ...defaultErrorMessages,
            ...this.errorMessages
        }
    }

    public writeValue(val: any) {
        this.value = val
        this.propagateChange(this.value)
        this.propagateTouch()
    }
    public registerOnChange(fn: (_: any) => void) { this.propagateChange = fn }
    public registerOnTouched(fn: () => void) { this.propagateTouch = fn }
}
