import { Injectable } from '@angular/core'
import { NavigationEnd } from '@angular/router'
import { AppConfig } from '@time/app-config'

declare const ga: Function

@Injectable()
export class GAnalyticsService {

    constructor() {}

    public getTracking(): string {
        return AppConfig.google_analytics_tracking_code
    }

    public send(event, location, currentRoute): void {
        if (event instanceof NavigationEnd) {
            const newRoute = location.path() || '/'   // When the route is '/', location.path actually returns ''
            if (currentRoute !== newRoute) {         // If the route has changed, send the new route to analytics
                ga('send', 'pageview', newRoute)
                currentRoute = newRoute
            }
        }
    }

    public init(): void {
        const init = (i: Window, s: Document, o: string, g: string, r: string, a?: any, m?: any) => {
            i['GoogleAnalyticsObject'] = r
            i[r] = i[r] || function() {
                (i[r].q = i[r].q || []).push(arguments)
            }
            i[r].l = 1 * Date.now()
            a = s.createElement(o)
            m = s.getElementsByTagName(o)[0]
            a.async = 1
            a.src = g
            m.parentNode.insertBefore(a, m)
        }

        init(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga')

        ga('create', this.getTracking(), 'auto')
        ga('send', 'pageview')
    }
}

/** Alternatively, use rxjs's built-in distinctUntilChanged method

this.router.events.distinctUntilChanged((previous: any, current: any) => {
	if(current instanceof NavigationEnd) {
		return previous.url === current.url;
	}
	return true;
}).subscribe((x: any) => {
	console.log('router.change', x);
	ga('send', 'pageview', x.url);
});

**/
