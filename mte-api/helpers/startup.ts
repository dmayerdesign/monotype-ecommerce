import * as rp from 'request-promise-native'

export function onStart(): void {

    // Keep the server from going to sleep.

    setInterval(function() {
        rp({uri: process.env.CLIENT_URL + '/ping'})
    }, 1000 * 60 * 15)
}
