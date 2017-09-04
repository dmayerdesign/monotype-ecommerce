const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const nodeModules = {};
require('dotenv').config();
const version = require('../../package.json').version;

module.exports = {
    name: 'server',
    target: 'node',
    entry: path.resolve(__dirname, '../src/server/server.ts'),
    output: {
        path: path.resolve(__dirname, '../dist/'),
        filename: 'server.js',
    },
    externals: nodeModules,
    resolve: {
      extensions: ['.ts', '.js', '.json', '.pug', '.html'],
      alias: {
        "@time/common": path.resolve(__dirname, '../../time-common'),
        "@time/app-config": path.resolve(__dirname, '../../app-config.ts'),
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
};
