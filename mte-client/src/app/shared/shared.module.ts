import { ModuleWithProviders, NgModule } from '@angular/core'

// Settings.
import { HttpSettings } from './config/http.settings'

// Feature modules.
import { MteFormsModule } from '@mte/common/lib/ng-modules/forms'
import { HttpInjectionTokens, MteHttpModule } from '@mte/common/lib/ng-modules/http'
import { MteUiModule } from '@mte/common/lib/ng-modules/ui'
import { CartModule } from './modules/cart/cart.module'

// Components.
import { LoginComponent } from './components/login/login.component'
import { SignupComponent } from './components/signup/signup.component'
import { SiteLocatorComponent } from './components/site-locator/site-locator.component'

@NgModule({
    imports: [
        MteFormsModule,
        MteHttpModule.forRoot(),
        MteUiModule.forRoot(),
        CartModule
    ],
    declarations: [
        SiteLocatorComponent,
        LoginComponent,
        SignupComponent,
    ],
    exports: [
        MteFormsModule,
        MteHttpModule,
        MteUiModule,
        CartModule,
        SiteLocatorComponent,
        LoginComponent,
        SignupComponent,
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
            ngModule: SharedModule,
        }
    }
}
