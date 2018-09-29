import { CommonModule } from '@angular/common'
import { ModuleWithProviders, NgModule } from '@angular/core'
import { MteFormsModule } from '@mte/common/lib/ng-modules/forms'
import { HttpInjectionTokens, MteHttpModule } from '@mte/common/lib/ng-modules/http'
import { MteUiModule } from '@mte/common/lib/ng-modules/ui'
import { HttpSettings } from '../config/http.settings'
import { LoginComponent } from './components/login/login.component'
import { SignupComponent } from './components/signup/signup.component'
import { SiteLocatorComponent } from './components/site-locator/site-locator.component'

@NgModule({
    imports: [
        CommonModule,
        MteFormsModule,
        MteHttpModule.forRoot(),
        MteUiModule.forRoot(),
    ],
    declarations: [
        SiteLocatorComponent,
        LoginComponent,
        SignupComponent,
    ],
    exports: [
        SiteLocatorComponent,
        LoginComponent,
        SignupComponent,
        MteFormsModule,
        MteHttpModule,
        MteUiModule,
    ],
})
export class SharedModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: [
                {
                    provide: HttpInjectionTokens.HttpSettings,
                    useValue: HttpSettings,
                },
            ],
        }
    }

    public static forChild(): ModuleWithProviders {
        return {
            ngModule: SharedModule
        }
    }
}
