require('dotenv').config()
import { environment as env } from './time-client/src/client/environments/environment'
import { appConfig as devConfig } from './time-common/config/app-config.dev'
import { appConfig as stagingConfig } from './time-common/config/app-config.staging'
import { appConfig as prodConfig } from './time-common/config/app-config.prod'

declare const process: any
let appConfig
if (process.env && process.env.ENVIRONMENT) {
	if (process.env.ENVIRONMENT === "production") {
		appConfig = prodConfig
	}
	else if (process.env.ENVIRONMENT === "staging") {
		appConfig = stagingConfig
	}
	else if (process.env.ENVIRONMENT === "development") {
		appConfig = devConfig
	}
}
else if (env) {
	if (env.production) {
		appConfig = prodConfig
	}
	else if (env.staging) {
		appConfig = stagingConfig
	}
	else if (env.development) {
		appConfig = devConfig
	}
}
export { appConfig }
