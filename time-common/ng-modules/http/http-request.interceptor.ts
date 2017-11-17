import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
} from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'

import { AppConfig } from '../../../app-config'

@Injectable()
export class TimeHttpRequestInterceptor implements HttpInterceptor {

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let newRequest = request
        if (request.url.indexOf("/api") === 0) {
            newRequest = request.clone({ url: AppConfig.client_url + request.url })
        }
        return next.handle(newRequest)
    }
}
