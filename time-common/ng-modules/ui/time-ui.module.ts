import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ClickOutsideModule } from 'ng-click-outside'

import { TimeModalComponent } from './components/modal/time-modal.component'
import { TimeToastComponent } from './components/toast/time-toast.component'
import { TimeTooltipComponent } from './components/tooltip/time-tooltip.component'

import { FocusOnDirective } from './directives/focus-on.directive'

import { TruncatePipe } from './pipes/truncate.pipe'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ClickOutsideModule,
    ],
    declarations: [
        TimeModalComponent,
        TimeToastComponent,
        TimeTooltipComponent,
        FocusOnDirective,
        TruncatePipe,
    ],
    exports: [
        CommonModule,
        ClickOutsideModule,
        TimeModalComponent,
        TimeToastComponent,
        TimeTooltipComponent,
        FocusOnDirective,
        TruncatePipe,
    ],
})
export class TimeUiModule { }
