import { AppConfig as StagingConfig } from './app-config.staging'

export class AppConfig extends StagingConfig {
    public static client_url = 'http://localhost:3000'
    public static cloudfront_url = 'https://d2jljqyuj03oqr.cloudfront.net'
    public static paypal_env: 'sandbox' | 'production' = 'production'
}
