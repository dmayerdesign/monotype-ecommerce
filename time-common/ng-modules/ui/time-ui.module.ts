import { CommonModule } from '@angular/common'
import { ModuleWithProviders, NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ClickOutsideModule } from 'ng-click-outside'

import { TimeModalComponent } from './components/modal/time-modal.component'
import { TimeToastComponent } from './components/toast/time-toast.component'
import { TimeTooltipComponent } from './components/tooltip/time-tooltip.component'

import { FocusOnDirective } from './directives/focus-on.directive'

import { TruncatePipe } from './pipes/truncate.pipe'

import { WindowRefService } from './services/window-ref.service'

import { InjectionTokens } from '../../constants/angular/injection-tokens'

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
export class TimeUiModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: TimeUiModule,
            providers: [
                WindowRefService
            ]
        }
    }
}
