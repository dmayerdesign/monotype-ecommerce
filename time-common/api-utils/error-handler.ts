import { Request, Response } from 'express'
import { Constants } from '../constants'

export function handleError(error: any, res?: Response, msg?: string, status?: number) {
    let message: string = Constants.Errors.genericErrorMessage

    // If the error is an Error and its message is tagged as usable, use the message
    if (error instanceof Error) {
        Object.keys(Constants.Errors.TAGS).forEach(tag => {
            if (error.message.indexOf(Constants.Errors.TAGS[tag]) > -1) {
                message = error.message.replace(Constants.Errors.TAGS[tag], "").trim()
            }
        })
    }
    // If the error is a string, assume it's a usable message
    if (typeof error === "string") message = error
    // If a "msg" argument is passed to handleError, always use that
    if (msg) message = msg

    if (res) {
        // Send the error message as a plain string
        res.status(status || error instanceof Object && error.status || 500).json(message)
    }
    console.error(error)
}
