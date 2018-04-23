import {
    AfterContentInit,
    Component,
    ContentChild,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs/Observable'
import { fromEvent } from 'rxjs/observable/fromEvent'
import { takeWhile } from 'rxjs/operators'

import { Copy } from '@mte/common/constants/copy'
import { HeartbeatComponent } from '@mte/common/lib/heartbeat/heartbeat.component'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { MteFormFieldOptions } from '../../models/form-field-options'

@Component({
    selector: 'mte-form-field',
    template: `
        <div class="form-group">
            <label *ngIf="options?.label"
                   [ngClass]="getLabelClassName()">
                {{ options.label }}
            </label>

            <div class="input-group">
                <ng-content></ng-content>
            </div>

            <span *ngIf="isShowingDefaultMessage"
                  [ngClass]="getErrorMessageClassNameObject()">
                {{ errorMessage }}
            </span>

            <ng-container *ngIf="isShowingCustomErrorMessage">
                <ng-container *ngTemplateOutlet="customErrorMessage"></ng-container>
            </ng-container>
        </div>
    `,
})
@Heartbeat()
export class MteFormFieldComponent extends HeartbeatComponent implements OnInit, OnDestroy, AfterContentInit {
    @Input() public options: MteFormFieldOptions
    @Input() public customErrorMessage: TemplateRef<any>
    @ContentChild('input', { read: ElementRef }) public input: ElementRef

    public element: ElementRef
    public errorMessage: string
    private parentValue: object = null
    private value: string = null
    public hasBlurred = false
    public isFocused = false

    public orderOfErrorsDisplayed = [
        'required',
        'email',
        'password',
    ]

    public ngOnInit(): void {
        const { control, errorMessages } = this.options

        if (!errorMessages) {
            this.setErrorMessage()
        }

        if (control) {
            control.valueChanges.pipe(takeWhile(() => this.isAlive))
                .subscribe((value) => {
                    this.value = value
                })

            control.parent.valueChanges.pipe(takeWhile(() => this.isAlive))
                .subscribe((value) => {
                    this.parentValue = value
                })
        }
    }

    public ngAfterContentInit(): void {
        if (this.input) {
            this.element = this.input
        }

        fromEvent(this.element.nativeElement, 'blur')
            .pipe(takeWhile(() => this.isAlive))
            .subscribe(() => {
                this.isFocused = false
                this.hasBlurred = true
            })

        fromEvent(this.element.nativeElement, 'focus')
            .pipe(takeWhile(() => this.isAlive))
            .subscribe(() => {
                this.isFocused = true
            })
    }

    public ngOnDestroy(): void { }

    public getLabelClassName(): string {
        const classNames: string[] = []
        return classNames.join(' ')
    }

    public getErrorMessageClassNameObject(): { [key: string]: boolean } {
        return {
            'text-danger': !this.isValid
        }
    }

    public get isValid(): boolean {
        if (this.options && this.options.control) {
            return this.options.control.valid
        }
        else {
            return true
        }
    }

    public get isShowingMessage(): boolean {
        if (!this.isValid) {
            if (this.options &&
                this.options.control &&
                this.options.control.dirty &&
                this.hasBlurred &&
                !this.isFocused
            ) {
                return true
            }
            else {
                return false
            }
        }
        else {
            return false
        }
    }

    public get isShowingDefaultMessage(): boolean {
        return this.isShowingMessage && !!this.errorMessage && !this.customErrorMessage
    }

    public get isShowingCustomErrorMessage(): boolean {
        return this.isShowingMessage && !!this.customErrorMessage
    }

    public get currentError(): string {
        if (!this.options || !this.options.control) return null

        const errors = this.options.control.errors

        if (!errors) {
            return null
        }

        const errorsArr = Object.keys(errors).sort((a, b) => {
            return (this.orderOfErrorsDisplayed.indexOf(a) > this.orderOfErrorsDisplayed.indexOf(b))
                ? -1
                : 1
        })

        if (errorsArr.length) {
            return errorsArr[0]
        }
        else {
            return null
        }
    }

    private setErrorMessage(): void {
        if (this.currentError && Object.keys(Copy.FormErrors.fieldError).some(x => x === this.currentError)) {
            this.errorMessage = Copy.FormErrors.fieldError[this.currentError]
        }
        else {
            this.errorMessage = this.currentError ? 'Invalid ' + this.currentError : null
        }
    }
}
