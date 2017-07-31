import rp from 'request-promise';
import { timer as Timer } from '../../../../time-common/models';

export function initStartupTasks() {

	/**
   * Keep server from going to sleep
   */
	setInterval(function() {
		rp({uri: "http://" + process.env.DOMAIN + "/ping"});
		// console.log("pinged the server");
	}, 300000);

	/**
	 * Restore timers, then remove them
	 */
	Timer.find({}, (err, timers) => {
		if (err) return console.log(err);
		if (!timers) return;

		// Delete timers, keeping the old timers in the variable `timers`
		Timer.remove({}, error => {
			if (error) console.error(error);

			timers.forEach(timer => {
				let data = timer.data;
				const timeout = timer.duration - (Date.now() - timer.startedAt);
				data.timeout = timeout;

				// If the timer is old, don't restore it
				if (data.timeout < 1) return;

				if (timer.endpoint.charAt(0) !== "/") {
					timer.endpoint = "/" + timer.endpoint;
				}

				rp({
					method: timer.method,
					uri: "http://" + process.env.DOMAIN + timer.endpoint,
					json: true,
					body: data,
				});
			});
		});
	});
}
