import { CommonModule } from '@angular/common'
import { ModuleWithProviders, NgModule } from '@angular/core'

import { TimeModalComponent } from './components/modal/time-modal.component'
import { TimeTooltipComponent } from './components/tooltip/time-tooltip.component'

import { CompileDirective } from './directives/compile.directive'
import { FocusOnDirective } from './directives/focus-on.directive'

import { TruncatePipe } from './pipes/truncate.pipe'

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        TimeModalComponent,
        TimeTooltipComponent,
        CompileDirective,
        FocusOnDirective,
        TruncatePipe,
    ],
    exports: [
        TimeModalComponent,
        TimeTooltipComponent,
        CompileDirective,
        FocusOnDirective,
        TruncatePipe,
    ],
})
export class TimeUiModule { }
