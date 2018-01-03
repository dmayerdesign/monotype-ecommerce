import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    Input,
    OnDestroy,
    OnInit,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { Subscription } from 'rxjs/Subscription'

import { AutoUnsubscribe } from '@time/common/utils/auto-unsubscribe/auto-unsubscribe.decorator'

@AutoUnsubscribe()
@Component({
    selector: 'time-field-validation',
    template: `
        <span *ngIf="messageIsShowing"
            [ngClass]="classNameObject">
            <ng-content *ngIf="message"></ng-content>
            <span *ngIf="defaultMessage">{{ defaultMessage }}</span>
        </span>`,
    styleUrls: ['./field-validation.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeFieldValidationComponent implements OnInit, OnDestroy {

    @Input() public control: FormControl
    @ContentChild('message') public message: any

    public defaultMessage: string = null
    public messageIsShowing = true
    public isValid = true
    public formGroupSubscription: Subscription
    public formControlSubscription: Subscription
    private parentValue: object = null
    private value: string = null

    constructor(
        public changeDetectorRef: ChangeDetectorRef
    ) { }

    public ngOnDestroy(): void { }

    public ngOnInit(): void {
        this.changeDetectorRef.detectChanges()

        if (!this.message) {
            this.setDefaultMessage()
        }

        this.formControlSubscription = this.control.valueChanges.subscribe((value) => {
            this.value = value
            this.isValid = this.control.valid
        })

        this.formGroupSubscription = this.control.parent.valueChanges.subscribe((value) => {
            this.parentValue = value
            this.isValid = this.control.valid
        })
    }

    public get classNameObject(): { [key: string]: boolean } {
        return {
            'text-danger': !this.isValid
        }
    }

    public get type(): string {
        const errors = this.control.errors
        console.log('Errors:', this.control.errors)
        for (const error in errors) {
            switch (error) {
                case 'email':
                    return error
                default:
                    return error
            }
        }
    }

    private setDefaultMessage(): void {
        if (this.type === 'email') {
            this.defaultMessage = 'Invalid email.'
        }
        else {
            this.defaultMessage = null
        }
        this.changeDetectorRef.markForCheck()
    }
}
