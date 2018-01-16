import {
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import 'rxjs/add/observable/fromEvent'

import { Copy } from '@time/common/constants/copy'
import { AutoUnsubscribe } from '@time/common/lib/auto-unsubscribe/auto-unsubscribe.decorator'
import { ITimeFormFieldOptions } from '../../models/form-field-options'

@AutoUnsubscribe()
@Component({
    selector: 'time-form-field',
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
                  [ngClass]="errorMessageClassNameObject">
                {{ errorMessage }}
            </span>

            <ng-container *ngIf="isShowingCustomErrorMessage">
                <ng-container *ngTemplateOutlet="customErrorMessage"></ng-container>
            </ng-container>
        </div>
    `,
})
export class TimeFormFieldComponent implements OnInit, OnDestroy {

    @Input() public options: ITimeFormFieldOptions
    @Input() public customErrorMessage: TemplateRef<any>
    @Input() public element: any

    public errorMessage: string
    public formGroupSubscription: Subscription
    public formControlSubscription: Subscription
    public inputBlurSubscription: Subscription
    public inputFocusSubscription: Subscription
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

        this.formControlSubscription = control.valueChanges.subscribe((value) => {
            this.value = value
        })

        this.formGroupSubscription = control.parent.valueChanges.subscribe((value) => {
            this.parentValue = value
        })

        if (window) {
            setTimeout(() => {
                this.inputBlurSubscription = Observable.fromEvent(this.element, 'blur').subscribe(() => {
                    this.isFocused = false
                    this.hasBlurred = true
                })

                this.inputFocusSubscription = Observable.fromEvent(this.element, 'focus').subscribe(() => {
                    this.isFocused = true
                })
            })
        }
    }

    public ngOnDestroy(): void { }

    public getLabelClassName(): string {
        const { showLabel } = this.options
        const classNames: string[] = []
        if (!showLabel) {
            classNames.push('sr-only')
        }
        return classNames.join(' ')
    }

    public get errorMessageClassNameObject(): { [key: string]: boolean } {
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
            if (this.options.control &&
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
