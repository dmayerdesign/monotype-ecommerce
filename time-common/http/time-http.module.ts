import { ModuleWithProviders, NgModule } from '@angular/core'
import { HttpClientModule } from '@angular/common/http'
import { HttpService } from './http.service'

@NgModule({
    imports: [ HttpClientModule ]
})
export class TimeHttpModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: TimeHttpModule,
            providers: [
                HttpService,
            ],
        }
    }
}
