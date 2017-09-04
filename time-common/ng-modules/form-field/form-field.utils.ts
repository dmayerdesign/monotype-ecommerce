import { Injectable } from '@angular/core'

@Injectable()
export class FormFieldUtils {

  getTimes(showAmPm: boolean = true): Array<{name: string; value: number}> {
		let options = []
		let loop = (amPm: 'am'|'pm') => {
		  for (let i = 0; i < 48; i++) { // 15 minute increments
		    let fractionStr = (i/4).toFixed(2).toString()
		    let timeStr: string
		    let timeStrBefore: string
		    let timeStrAfter: string
		    let halfDay: number = amPm === 'pm' ? 3600000 * 12 : 0
		    if (i < 4) {
		      timeStrBefore = "12"
		    }
		    else {
		      timeStrBefore = Math.floor(i/4).toFixed().toString()
		    }

		    timeStrAfter = (function() {
		      let decimals = fractionStr.substring(fractionStr.length - 2)
		      return (decimals === '00') ? '00' : (decimals === '25') ? '15' : (decimals === '50') ? '30' : (decimals === '75') ? '45' : '00'
		    }());

		    timeStr = showAmPm ? timeStrBefore + ":" + timeStrAfter + " " + amPm : timeStrBefore + ":" + timeStrAfter
		    options.push({
		      name: timeStr,
		      value: (i * 900000) + halfDay,
		    })
		  }
		};
		loop('am')
		loop('pm')
		return options
	}
}
