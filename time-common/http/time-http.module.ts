import { HTTP_INTERCEPTORS } from '@angular/common/http'
import { HttpClientModule } from '@angular/common/http'
import { ModuleWithProviders, NgModule } from '@angular/core'
import { TimeHttpService } from './http.service'

@NgModule({
    imports: [ HttpClientModule ],
})
export class TimeHttpModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: TimeHttpModule,
            providers: [
                TimeHttpService,
            ],
        }
    }
}
