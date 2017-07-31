const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const nodeModules = {};
require('dotenv').config();
const version = require('../package.json').version;

module.exports = {
    name: 'server',
    target: 'node',
    entry: path.resolve(__dirname, '../src/server/bootstrap.ts'),
    output: {
        path: path.resolve(__dirname, '../dist/'),
        filename: 'server.js',
    },
    externals: nodeModules,
    resolve: {
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
            path.resolve(__dirname, '../src/server'),
          ],
        },
        {
          test: /\.js$/,
          use: [
            'babel-loader',
          ],
          exclude: /node_modules/,
          include: [
            path.resolve(__dirname, '../src/server'),
          ],
        },
        {test: /\.pug$/, loader: 'pug-loader'},
        {test: /\.html$/, loader: 'raw-loader'},
        { test:  /\.json$/, loader: 'json-loader' },
      ],
      exprContextCritical: false,
    },
};
