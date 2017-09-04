import { appConfig as devConfig } from './app-config.dev'

const stagingConfig = {
	client_url: "http://localhost:3000",
	paypal_env: 'sandbox',
}

export const appConfig = Object.assign({}, devConfig, stagingConfig)
