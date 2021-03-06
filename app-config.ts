import { AppConfig as DevConfig } from '@mte/common/config/app-config.dev'
import { AppConfig as ProdConfig } from '@mte/common/config/app-config.prod'
import { AppConfig as StagingConfig } from '@mte/common/config/app-config.staging'
import { environment as env } from '@mte/environment'

export interface Environment {
    production?: boolean
    staging?: boolean
    development?: boolean
}

declare const process: any

let AppConfig = class AppConfig extends ProdConfig { }

if (typeof process !== 'undefined' && process.env && process.env.ENVIRONMENT) {
    if (process.env.ENVIRONMENT === 'production') {
        AppConfig = ProdConfig
    }
    else if (process.env.ENVIRONMENT === 'staging') {
        AppConfig = StagingConfig
    }
    else if (process.env.ENVIRONMENT === 'development') {
        AppConfig = DevConfig
    }
}
else if (env) {
    if ((<Environment>env).production) {
        AppConfig = ProdConfig
    }
    else if ((<Environment>env).staging) {
        AppConfig = StagingConfig
    }
    else if ((<Environment>env).development) {
        AppConfig = DevConfig
    }
}
export { AppConfig }
