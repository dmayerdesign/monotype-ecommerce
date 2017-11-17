import { inject, injectable } from 'inversify'
import * as rp from 'request-promise'
import { InstanceType } from 'typegoose'

import { Types } from '@time/common/constants/inversify'
import { Timer, TimerModel } from '@time/common/models/api-models/timer'

@injectable()
export class TimerService {
    constructor(@inject(Types.ErrorService) private errorService) {
        this.onInit()
    }

    public onInit() {
        this.restartAll()
    }

    public async restartAll() {
        let timers: InstanceType<Timer>[]
        const requests = []
        let requestPromises: Promise<any>[] = []

        // Find all existing timers.

        try {
            timers = await TimerModel.find({})
        }
        catch (error) {
            this.errorService.handleError(error)
        }

        // Delete all existing timers.

        try {
            await TimerModel.remove({})
        }
        catch (error) {
            this.errorService.handleError(error)
        }

        // Create new API requests based on the old timers.

        timers.forEach(timer => {
            const data = timer.data
            const timeout = timer.duration - (Date.now() - timer.startedAt)

            // If the timer is old, don't restore it.
            if (timeout < 0) return

            requests.push({
                method: timer.method,
                uri: timer.url,
                json: true,
                body: data,
            })
        })

        requestPromises = requests.map(request => rp(request))

        Promise.all(requestPromises)
            .catch((error) => {
                this.errorService.handleError(error)
            })
    }
}
