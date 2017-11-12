require('dotenv').config()
import { appConfig as devConfig } from '@time/common/config/app-config.dev'
import { appConfig as prodConfig } from '@time/common/config/app-config.prod'
import { appConfig as stagingConfig } from '@time/common/config/app-config.staging'
import { environment as env } from '@time/environment'

export interface IEnvironment {
    production?: boolean
    staging?: boolean
    development?: boolean
}

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
    if ((<IEnvironment>env).production) {
        appConfig = prodConfig
    }
    else if ((<IEnvironment>env).staging) {
        appConfig = stagingConfig
    }
    else if ((<IEnvironment>env).development) {
        appConfig = devConfig
    }
}
export { appConfig }
