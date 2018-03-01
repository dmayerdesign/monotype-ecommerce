import { CommonModule } from '@angular/common'
import { ModuleWithProviders, NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { ClickOutsideModule } from 'ng-click-outside'

import { MteModalComponent } from './components/modal/mte-modal.component'
import { MteNavigationListComponent } from './components/navigation/mte-navigation-list.component'
import { MteToastComponent } from './components/toast/mte-toast.component'
import { MteTooltipComponent } from './components/tooltip/mte-tooltip.component'

import { FocusOnDirective } from './directives/focus-on.directive'

import { TruncatePipe } from './pipes/truncate.pipe'

import { WindowRefService } from './services/window-ref.service'

import { InjectionTokens } from '../../constants/angular/injection-tokens'

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([]),
        FormsModule,
        ReactiveFormsModule,
        ClickOutsideModule,
    ],
    declarations: [
        MteModalComponent,
        MteNavigationListComponent,
        MteToastComponent,
        MteTooltipComponent,
        FocusOnDirective,
        TruncatePipe,
    ],
    exports: [
        CommonModule,
        ClickOutsideModule,
        MteModalComponent,
        MteNavigationListComponent,
        MteToastComponent,
        MteTooltipComponent,
        FocusOnDirective,
        TruncatePipe,
    ],
})
export class MteUiModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: MteUiModule,
            providers: [
                WindowRefService
            ]
        }
    }
}
