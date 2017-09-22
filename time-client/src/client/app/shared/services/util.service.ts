import { Injectable } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'

import { UiService } from './ui.service'

@Injectable()
export class UtilService {

    private dateMidnightMillis: number

    constructor(
        private titleService: Title,
        private ui: UiService,
    ) {}

    setTitle(title: string): void {
        this.titleService.setTitle(title + ' | A2EE')
    }

    handleError(serverMsg: any, msg?: string): boolean {
        if (typeof serverMsg === "string") {
            if (serverMsg.charAt(0) === "{") serverMsg = JSON.parse(serverMsg).error
        }
        console.error(serverMsg)
        if (this.ui && this.ui.flash) {
            this.ui.flash(msg || serverMsg || "Oops! Something went wrong. Please try again.", "error")
        }
        if (serverMsg) return true
        else return false
    }

    getFromLocalStorage(key: string): any {
        const item = localStorage.getItem(key)
        if (item && item.length) {
            if (item.charAt(0) === '[' || item.charAt(0) === '{') {
                return JSON.parse(item)
            }
            else {
                return item
            }
        }
        return null
    }

    gToOz(pK: number): number {
            const nearExact = pK / 453.59237
            const lbs = Math.floor(nearExact)
            const oz = (nearExact - lbs) * 16
            return oz
    }

    ozToG(pK: number): number {
        return pK * 28.3495
    }

    getTimes(noAmPm?: boolean): Array<{name: string; value: number}> {
        const options = []
        const loop = (amPm: 'am'|'pm') => {
            for (let i = 0; i < 48; i++) { // 15 minute increments
                const fractionStr = (i / 4).toFixed(2).toString()
                let timeStr: string
                let timeStrBefore: string
                let timeStrAfter: string
                const halfDay: number = amPm === 'pm' ? 3600000 * 12 : 0
                if (i < 4) {
                    timeStrBefore = "12"
                }
                else {
                    timeStrBefore = Math.floor(i / 4).toFixed().toString()
                }

                timeStrAfter = (function() {
                    const decimals = fractionStr.substring(fractionStr.length - 2)
                    return (decimals === '00') ? '00' :
                        (decimals === '25') ? '15' :
                        (decimals === '50') ? '30' :
                        (decimals === '75') ? '45' :
                        '00'
                }())

                timeStr = noAmPm ? timeStrBefore + ':' + timeStrAfter : timeStrBefore + ':' + timeStrAfter + ' ' + amPm
                options.push({
                    name: timeStr,
                    value: (i * 900000) + halfDay,
                })
            }
        }
        loop('am')
        loop('pm')
        return options
    }

    getTimesMap(): any {
            const times = this.getTimes()
            const map = {}
            times.forEach(time => {
                    map[time.value] = time.name
            })
            return map
    }
}
