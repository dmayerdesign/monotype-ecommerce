import { AppConfig as DevConfig } from './app-config.dev'

export class AppConfig extends DevConfig {
    public static client_url = "http://localhost:3000"
    public static paypal_env: 'sandbox' | 'production' = 'sandbox'
}
