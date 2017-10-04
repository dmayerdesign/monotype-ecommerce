import { forwardRef, ChangeDetectionStrategy, Component } from '@angular/core'
import { NG_VALUE_ACCESSOR } from '@angular/forms'
import { TimeFormControlComponent } from '../form-control.component'

@Component({
    selector: 'time-input',
    template: `
        <input name="name" [(ngModel)]="value">
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TimeInputComponent),
            multi: true,
        },
    ],
})
export class TimeInputComponent extends TimeFormControlComponent { }
