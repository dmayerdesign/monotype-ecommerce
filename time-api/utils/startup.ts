import { TimerModel } from '@time/common/models/api-models/timer'
import * as rp from 'request-promise'

export function onStart() {

	/**
     * Keep server from going to sleep
     */
    setInterval(function() {
        rp({uri: process.env.CLIENT_URL + "/ping"})
    }, 300000)

}
