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
      alias: {
        '@time/interfaces': path.resolve(__dirname, '../../time-common/models/interfaces'),
        '@time/models': path.resolve(__dirname, '../../time-common/models/db-models'),
        '@time/api-services': path.resolve(__dirname, '../../time-common/api-services'),
        '@time/constants': path.resolve(__dirname, '../../time-common/constants'),
      },
      extensions: ['.ts', '.js', '.json', '.pug', '.html'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            'ts-loader',
          ],
          exclude: /node_modules/,
          include: [
            path.resolve(__dirname, '../../time-common'),
            path.resolve(__dirname, '../src/server'),
          ],
        },
        {test: /\.pug$/, use: 'pug-loader'},
        {test: /\.html$/, use: 'raw-loader'},
        {test:  /\.json$/, use: 'json-loader'},
      ],
      exprContextCritical: false,
    },
};
