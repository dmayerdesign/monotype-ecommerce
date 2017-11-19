import { Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import { SeoService } from './seo.service'

@Injectable()
export class UtilService {

    public serverError$ = new Subject<any>()

    constructor(
        private seo: SeoService,
    ) {}

    public setTitle(title: string): void {
        this.seo.setTitle(title)
    }

    public getFromLocalStorage(key: string): object|string|undefined {
        const item = localStorage.getItem(key)
        if (item && item.length) {
            if (item.charAt(0) === '[' || item.charAt(0) === '{') {
                return JSON.parse(item)
            }
            else {
                return item
            }
        }
        return undefined
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
}
