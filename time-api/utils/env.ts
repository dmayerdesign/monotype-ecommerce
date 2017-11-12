require('dotenv').config()

export function isDev(): boolean {
    return process.env.ENVIRONMENT === 'development' || process.env.ENVIRONMENT === 'dev'
}

export function isStaging(): boolean {
    return process.env.ENVIRONMENT === 'staging'
}

export function isProduction(): boolean {
    return process.env.ENVIRONMENT === 'production'
}

export function isProd(): boolean {
    return this.isProduction()
}
