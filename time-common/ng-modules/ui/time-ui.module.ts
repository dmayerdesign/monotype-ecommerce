import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ClickOutsideModule } from 'ng-click-outside'

import { TimeModalComponent } from './components/modal/time-modal.component'
import { TimeTooltipComponent } from './components/tooltip/time-tooltip.component'

import { CompileDirective } from './directives/compile.directive'
import { FocusOnDirective } from './directives/focus-on.directive'

import { TruncatePipe } from './pipes/truncate.pipe'

@NgModule({
    imports: [
        CommonModule,
        ClickOutsideModule,
    ],
    declarations: [
        TimeModalComponent,
        TimeTooltipComponent,
        CompileDirective,
        FocusOnDirective,
        TruncatePipe,
    ],
    exports: [
        CommonModule,
        ClickOutsideModule,
        TimeModalComponent,
        TimeTooltipComponent,
        CompileDirective,
        FocusOnDirective,
        TruncatePipe,
    ],
})
export class TimeUiModule { }
