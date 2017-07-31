require('dotenv').config({silent: true});
declare const process: any;

// CONSTANTS
const dev_domain = "localhost:3000";
const stage_domain = "localhost:3000";
const prod_domain = "localhost:3000";

/************************************************
DEV
************************************************/

let devConfig = {
    aws_bucket: "a2ee",
    blog_root: "blog",
	client_domain: dev_domain,
	cloudfront_domain: "https://d1eqpdomqeekcv.cloudfront.net",
	company_name: "TOOTR",
	company_email: "d.a.mayer92@gmail.com",

	branding: {
		logos: {
			wordmark: {
                get white() { return devConfig.protocol + dev_domain + "/static/images/wordmark-white.png" },
                set white(val) { devConfig.branding.logos.wordmark.white = val },
			},
		},
		colors: {
			primary: "#00b0ff",
			accent: "#ff3c7c",
		},
	},

	businessInfo: {
		shippingAddress: {
			company: "TOOTR",
			street1: "984 Moessner Ave",
			street2: "",
			city: "Union",
			state: "New Jersey",
			zip: "07083",
			country: "United States",
		},
	},

	emailOptions: {
		default: {
			fromName: "TOOTR",
			fromEmail: "d.a.mayer92@gmail.com",
		},
	},

	facebookApiVersion: 2.9,
	facebookAppId: '250653628750155',
	facebookUrl: 'https://facebook.com',

	geonames_user: 'tootr',
	google_analytics_tracking_code: "XX-XXXXXXXX-X",

	google_maps_api_key: "AIzaSyAHlD8GPJ5lccDDhplrEcQI1He1FGW6xvI",
	locator_map_markers: [
		{
			marker: ["Hyzer Shop", 45.267885, -83.734770],
			description: "Michigan-based disc golf retailer"
		}
	],

	inviteCode: "xwSb62ik0k1k6dsC9Li0qkaGuZZxHQQoV5lsuyh1kWRS3twMLKf0xv29e1m6e2NXb3O6BjoxrtfQcHyhQvdq0FnJhIcLG3G7kan3",
	paypal_env: 'sandbox',
	product_path: "/shop/product",
    protocol: 'http://',
    pw_encryption_key: "AFItS2KCpzCioIiL7Yr09JBORXFpHE1HWlDZmHeT",
};


/************************************************
PRODUCTION
************************************************/

let prodConfig = Object.assign({ ...devConfig }, {
	client_domain: prod_domain,
	company_email: "support@tootrapp.com",
	cloudfront_domain: "https://d2jljqyuj03oqr.cloudfront.net",
	emailOptions: {
		default: {
			fromName: "TOOTR",
			fromEmail: "support@tootrapp.com",
		},
	},
	facebookAppId: '213565672483283',
	facebookApiVersion: 2.8,
	paypal_env: 'production',
	protocol: 'https://',
});
prodConfig.branding.logos.wordmark.white = prodConfig.protocol + prod_domain + "/static/images/wordmark-white.png";


/************************************************
STAGE
************************************************/

let stageConfig = Object.assign({ ...prodConfig }, {
	client_domain: stage_domain,
	facebookAppId: '1880782808836878',
	facebookApiVersion: 2.9,
	paypal_env: 'sandbox',
	protocol: 'https://',
});
stageConfig.branding.logos.wordmark.white = stageConfig.protocol + stage_domain + "/static/images/wordmark-white.png";


/************************************************
Export
************************************************/

var appConfig;
if (process.env.ENVIRONMENT === "PRODUCTION") {
	appConfig = prodConfig;
}
else if (process.env.ENVIRONMENT === "STAGE") {
	appConfig = stageConfig;
}
else if (process.env.ENVIRONMENT === "DEV") {
	appConfig = devConfig;
}
export { appConfig };
