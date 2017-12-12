const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const CircularDependencyPlugin = require('circular-dependency-plugin')
require('dotenv').config()
const packageJson = require('../../package.json')
const version = packageJson.version

// Exclude all packages from the build, since your node server
// has access to node_modules directly
const externals = {}
fs.readdirSync(path.resolve(__dirname, '../../node_modules'))
	.filter(x => ['.bin'].indexOf(x) === -1)
	.forEach(mod => {
		// Don't forget scoped packages
		if (mod.indexOf('@') === 0) {
			fs.readdirSync(path.resolve(__dirname, '../../node_modules/' + mod))
				.filter(x => ['.bin'].indexOf(x) === -1)
				.forEach(subMod => {
					externals[mod + '/' + subMod] = `commonjs ${mod + '/' + subMod}`
				})
		}
		else {
			externals[mod] = `commonjs ${mod}`
		}
	})

module.exports = {
	name: 'server',
	target: 'node',
	externals,
	entry: path.resolve(__dirname, '../server.ts'),
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
					'awesome-typescript-loader',
					'angular2-template-loader',
				],
				exclude: [
					/node_modules/,
				],
			},
			{
				test: /node_modules\/JSONStream\/index\.js$/,
				use: ['shebang-loader'],
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
		new CircularDependencyPlugin({
			// exclude detection of files based on a RegExp
			exclude: /node_modules/,
			// add errors to webpack instead of warnings
			failOnError: true,
			// set the current working directory for displaying module paths
			cwd: process.cwd(),
		})
	],
}
