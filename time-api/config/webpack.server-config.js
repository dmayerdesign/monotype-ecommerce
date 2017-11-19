const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
require('dotenv').config()
const packageJson = require('../../package.json')
const version = packageJson.version

const externals = {}
fs.readdirSync(path.resolve(__dirname, '../../node_modules'))
	.filter(x => ['.bin'].indexOf(x) === -1)
	.forEach(mod => {
		externals[mod] = `commonjs ${mod}`
	})

module.exports = {
	name: 'server',
	target: 'node',
	entry: path.resolve(__dirname, '../server.ts'),
	externals,
	output: {
			path: path.resolve(__dirname, '../../dist/'),
			filename: 'server.js',
	},
	resolve: {
		extensions: ['.ts', '.js', '.json', '.pug', '.html'],
		alias: {
			"@time/common": path.resolve(__dirname, '../../time-common'),
			"@time/app-config": path.resolve(__dirname, '../../app-config.ts'),
			"@time/environment": path.resolve(__dirname, '../../time-client/src/environments/environment.ts'),
		},
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: [
					'ts-loader',
					'angular2-template-loader',
				],
				exclude: [
					/node_modules/,
				],
			},
			{
				test: /node_modules\/JSONStream\/index\.js$/,
				use: ['shebang-loader']
			},
			{
				test: /\.(css|scss)$/,
				use: [
					'to-string-loader',
					'css-loader',
					'sass-loader',
				],
			},
			{test: /\.pug$/, use: 'pug-loader'},
			{test: /\.html$/, use: 'raw-loader'},
			{test: /\.json$/, use: 'json-loader'},
			{
				test: /\.(jpg|png|woff|ttf|svg)$/,
				use: 'url-loader',
			},
		],
	},
	plugins: [
		new webpack.IgnorePlugin(/^vertx$/),
		// Prevents errors in the server-rendered Angular app when `document` or `window` are accessed
		new webpack.DefinePlugin({
			window: undefined,
			document: undefined,
		}),
	],
}
