import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { Subject } from 'rxjs/Subject'

@Injectable()
export class UtilService {

    constructor() {}

    public timeout(timeout: number): Observable<any> {
        const subject = new ReplaySubject(1)
        const observable = subject.asObservable().delay(timeout)
        subject.next(0)
        return observable
    }

    public getFromLocalStorage(key: string): object|string|undefined {
        if (window && window.localStorage) {
            const item = window.localStorage.getItem(key)
            if (item && item.length) {
                if (item.charAt(0) === '[' || item.charAt(0) === '{') {
                    return JSON.parse(item)
                }
                else {
                    return item
                }
            }
        }
        return undefined
    }

    public saveToLocalStorage(key: string, payload: any): void {
        if (window && window.localStorage) {
            window.localStorage.setItem(key, payload)
        }
    }

    public removeFromLocalStorage(key: string): void {
        if (window && window.localStorage) {
            window.localStorage.removeItem(key)
        }
    }

    public gToOz(pK: number): number {
            const nearExact = pK / 453.59237
            const lbs = Math.floor(nearExact)
            const oz = (nearExact - lbs) * 16
            return oz
    }

    public ozToG(pK: number): number {
        return pK * 28.3495
    }

    /**
     * Load a script from the provided `url` into the <head>.
     *
     * @see https://www.nczonline.net/blog/2009/07/28/the-best-way-to-load-external-javascript/
     *
     * @export
     * @param {any} url
     * @returns {Promise<void>}
     */
    public loadScript(url) {
        return new Promise<void>((resolve, reject) => {
            if (!window) { // If server app, error out immediately.
                reject()
                return
            }

            const script = document.createElement('script')
            script.type = 'text/javascript'

            if ((script as any).readyState){  // IE fix.
                (script as any).onreadystatechange = () => {
                    if ((script as any).readyState === 'loaded' ||
                        (script as any).readyState === 'complete'
                    ) {
                        (script as any).onreadystatechange = null
                        resolve()
                    }
                }
            } else {  // Others
                script.onload = function() {
                    resolve()
                }
            }

            script.src = url
            document.getElementsByTagName('head')[0].appendChild(script)
        })
    }
}
