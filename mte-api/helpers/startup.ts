import * as rp from 'request-promise-native'

export function onStart() {

	/**
     * Keep server from going to sleep
     */
    setInterval(function() {
        rp({uri: process.env.CLIENT_URL + '/ping'})
    }, 300000)

}
