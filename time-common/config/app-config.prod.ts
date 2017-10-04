import { appConfig as stagingConfig } from './app-config.staging'

const prodConfig = {
    client_url: "http://localhost:3000",
    cloudfront_url: "https://d2jljqyuj03oqr.cloudfront.net",
    paypal_env: 'production',
}

export const appConfig = Object.assign({}, stagingConfig, prodConfig)
