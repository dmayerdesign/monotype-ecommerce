import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MteFormsModule } from '@mte/common/lib/ng-modules/forms'
import { MteHttpModule } from '@mte/common/lib/ng-modules/http'
import { MteUiModule } from '@mte/common/lib/ng-modules/ui'
import { LoginComponent } from './components/login/login.component'
import { SignupComponent } from './components/signup/signup.component'
import { SiteLocatorComponent } from './components/site-locator/site-locator.component'

@NgModule({
    imports: [
        CommonModule,
        MteFormsModule,
        MteHttpModule.forChild(),
        MteUiModule.forChild(),
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
    ],
})
export class SharedComponentsModule { }
