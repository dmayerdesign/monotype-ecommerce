import { Injectable } from '@angular/core'
import CONSTANTS from '@time/common/constants'

@Injectable()
export class ValidationService {
    
    validate(value: any, event: KeyboardEvent, type: string, validators: string[], options: any): string[] {

        let invalid: any[]

        let emailPattern = new RegExp(CONSTANTS.REGEX.emailAddress)
        let datePattern = new RegExp(CONSTANTS.REGEX.date)
        let passwordPattern = new RegExp(CONSTANTS.REGEX.password1)
        let zipPattern = new RegExp(CONSTANTS.REGEX.postalCode)
        let usernamePattern = new RegExp(CONSTANTS.REGEX.username, 'i')
        let sanitaryPattern = usernamePattern

        invalid = []
        
        if (validators.indexOf('required') > -1) {
            if (!value) {
                invalid.push("required")
            }
            else if (invalid.indexOf("required") > -1) {
                invalid.splice(invalid.indexOf("required"), 1)
            }
        }

        if (validators.indexOf('email') > -1) {
            if (value && !value.match(emailPattern)) {
                invalid.push("email")
            }
            else if (invalid.indexOf("email") > -1) {
                invalid.splice(invalid.indexOf("email"), 1)
            }
        }

        if (validators.indexOf('zip') > -1) {
            if (value && !value.match(zipPattern)) {
                invalid.push("zip")
            }
            else if (invalid.indexOf("zip") > -1) {
                invalid.splice(invalid.indexOf("zip"), 1)
            }
        }

        if (validators.indexOf('date') > -1) {
            if (type === 'date') {
                let dateStr = value
                if (dateStr && !dateStr.match(datePattern)) {
                if (dateStr.length > 5 && dateStr.match(/^\d+$/)) {
                    dateStr = dateStr.substr(0, 2) + '/' + dateStr.substr(2, 2) + '/' + dateStr.substr(4)
                }
                else if (event && (dateStr.length === 2 || dateStr.length === 5) && event.keyCode !== 8) {
                    dateStr += '/'
                }
                else if ((dateStr.length === 3 || dateStr.length === 4) && dateStr.match(/^\d+$/)) {
                    dateStr = dateStr.substr(0, 2) + '/' + dateStr.substr(2)
                }
                else {
                    invalid.push("date")
                }
                
                if (type === 'date') {
                    value = dateStr
                }
                }
                else if (invalid.indexOf("date") > -1) {
                invalid.splice(invalid.indexOf("date"), 1)
                }
            }
            if (type === 'datepicker') {
                if (value && ! value.valid) {
                invalid.push("date")
                }
                else if (invalid.indexOf("date") > -1) {
                invalid.splice(invalid.indexOf("date"), 1)
                }
            }
        }

        if (validators.indexOf('password') > -1) {
            if (!value || !value.match(passwordPattern) || value.length < 6) {
                invalid.push("password")
            } else if (invalid.indexOf("password") > -1) {
                invalid.splice(invalid.indexOf("password"), 1)
            }
        }

        if (validators.indexOf('confirmPassword') > -1) {
            if (!value || value !== options.confirm) {
                invalid.push("confirmPassword")
            } else if (invalid.indexOf("confirmPassword") > -1) {
                invalid.splice(invalid.indexOf("confirmPassword"), 1)
            }
        }

        if (validators.indexOf('interval') > -1) {
            if ((options.interval === "start" && options.intervalEnd < value) || (options.interval === "end" && options.intervalStart > value)) {
                invalid.push("interval")
            } else if (invalid.indexOf("interval") > -1) {
                invalid.splice(invalid.indexOf("interval"), 1)
            }
        }

        if (validators.indexOf('username') > -1) {
            if (value && !value.match(usernamePattern)) {
                invalid.push("username")
            } else if (invalid.indexOf("username") > -1) {
                invalid.splice(invalid.indexOf("username"), 1)
            }
        }

        if (validators.indexOf('sanitary') > -1) {
            if (value && !value.match(sanitaryPattern)) {
                invalid.push("sanitary")
            } else if (invalid.indexOf("sanitary") > -1) {
                invalid.splice(invalid.indexOf("sanitary"), 1)
            }
        }

        if (validators.indexOf('maxLength') > -1) {
            if (value && value.length > options.maxlength) {
                invalid.push("maxLength")
            } else if (invalid.indexOf("maxLength") > -1) {
                invalid.splice(invalid.indexOf("maxLength"), 1)
            }
        }

        return invalid
    }
}