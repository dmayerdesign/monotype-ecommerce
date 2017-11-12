import { injectable } from "inversify"

@injectable()
export class TimerService {
	/**
	 * Restore timers, then remove them
	 */
    public async restart() {
        try {
            const timers = await TimerModel.find({})
        }

        try {
            await TimerModel.remove({})
        }
        catch (error) {

        }

            Timer.find({}, (err, timers) => {
                if (err) return console.log(err)
                if (!timers) return

				// Delete timers, keeping the old timers in the variable `timers`
                Timer.remove({}, error => {
                    if (error) console.error(error)

                    timers.forEach(timer => {
                        const data = timer.data
                        const timeout = timer.duration - (Date.now() - timer.startedAt)
                        data.timeout = timeout

						// If the timer is old, don't restore it
                        if (data.timeout < 1) return

                        if (timer.endpoint.charAt(0) !== "/") {
                            timer.endpoint = "/" + timer.endpoint
                        }

                        rp({
                            method: timer.method,
                            uri: process.env.CLIENT_URL + timer.endpoint,
                            json: true,
                            body: data,
                        })
                    })
                })
            })
    }
}
