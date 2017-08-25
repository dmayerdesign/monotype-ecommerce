require('dotenv').config({silent: true});
import { environment as env } from '../../time-client/src/client/environments/environment';
declare const process: any;

// CONSTANTS
const dev_url = "http://localhost:3000";
const stage_url = "http://localhost:3000";
const prod_url = "http://localhost:3000";

/********************************
**********             **********
**********     DEV     **********
**********             **********
********************************/

let devConfig = {
    aws_bucket: "a2ee",
    blog_root: "blog",
	client_url: dev_url,
	cloudfront_url: "https://d1eqpdomqeekcv.cloudfront.net",
	company_name: "Hyzer Shop",
	company_email: "armando@hyzershop.com",

	branding: {
		logos: {
			wordmark: {
                white: dev_url + "/static/images/wordmark-white.png",
			},
		},
		colors: {
			primary: "#00b0ff",
			accent: "#ff3c7c",
		},
	},

	businessInfo: {
		shippingAddress: {
			company: "Hyzer Shop",
			street1: "8023 Bayside View Dr",
			street2: "",
			city: "Orlando",
			state: "Florida",
			zip: "32819",
			country: "United States",
		},
	},

	emailOptions: {
		default: {
			fromName: "Hyzer Shop",
			fromEmail: "danny@hyzershop.com",
		},
	},

	facebookApiVersion: 2.9,
	facebookAppId: '206236863117468',
	facebookUrl: 'https://facebook.com/hyzershop',

	google_analytics_tracking_code: "XX-XXXXXXXX-X",

	google_maps_api_key: "AIzaSyAHlD8GPJ5lccDDhplrEcQI1He1FGW6xvI",
	locator_map_markers: [
		{
			marker: ["Hyzer Shop", 45.267885, -83.734770],
			description: "Michigan-based disc golf retailer"
		}
	],

	paypal_env: 'sandbox',
	product_path: "/shop/product",
};


/*********************************
**********              **********
**********  PRODUCTION  **********
**********              **********
*********************************/

let prodConfig = Object.assign({ ...devConfig }, {
	client_url: prod_url,
	company_email: "support@tootrapp.com",
	cloudfront_url: "https://d2jljqyuj03oqr.cloudfront.net",
	emailOptions: {
		default: {
			fromName: "TOOTR",
			fromEmail: "support@tootrapp.com",
		},
	},
	facebookAppId: '213565672483283',
	facebookApiVersion: 2.8,
	paypal_env: 'production',
});
prodConfig.branding.logos.wordmark.white = prod_url + "/static/images/wordmark-white.png";


/********************************
**********             **********
**********    STAGE    **********
**********             **********
********************************/

let stageConfig = Object.assign({ ...prodConfig }, {
	client_url: stage_url,
	facebookAppId: '1880782808836878',
	facebookApiVersion: 2.9,
	paypal_env: 'sandbox',
});
stageConfig.branding.logos.wordmark.white = stage_url + "/static/images/wordmark-white.png";


/*********************************
**********    EXPORT    **********
*********************************/

var appConfig;

if (process.env && process.env.ENVIRONMENT) {
	if (process.env.ENVIRONMENT === "PRODUCTION") {
		appConfig = prodConfig;
	}
	// else if (process.env.ENVIRONMENT === "STAGE") {
	// 	appConfig = stageConfig;
	// }
	else if (process.env.ENVIRONMENT === "DEV") {
		appConfig = devConfig;
	}
}
else if (env) {
	if (env.production) {
		appConfig = prodConfig;
	}
	// else if (env.stage) {
	// 	appConfig = stageConfig;
	// }
	else {
		appConfig = devConfig;
	}
}
export { appConfig };
