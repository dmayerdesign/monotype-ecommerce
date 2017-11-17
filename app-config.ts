require('dotenv').config()
import { AppConfig as DevConfig } from '@time/common/config/app-config.dev'
import { AppConfig as ProdConfig } from '@time/common/config/app-config.prod'
import { AppConfig as StagingConfig } from '@time/common/config/app-config.staging'
import { environment as env } from '@time/environment'

export interface IEnvironment {
    production?: boolean
    staging?: boolean
    development?: boolean
}

declare const process: any

let AppConfig = class AppConfig extends ProdConfig { }

if (process.env && process.env.ENVIRONMENT) {
    if (process.env.ENVIRONMENT === "production") {
        AppConfig = ProdConfig
    }
    else if (process.env.ENVIRONMENT === "staging") {
        AppConfig = StagingConfig
    }
    else if (process.env.ENVIRONMENT === "development") {
        AppConfig = DevConfig
    }
}
else if (env) {
    if ((<IEnvironment>env).production) {
        AppConfig = ProdConfig
    }
    else if ((<IEnvironment>env).staging) {
        AppConfig = StagingConfig
    }
    else if ((<IEnvironment>env).development) {
        AppConfig = DevConfig
    }
}
export { AppConfig }
