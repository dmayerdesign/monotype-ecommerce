var config = require('./webpack.server-config');
const path = require('path');

config.output.path = path.resolve(__dirname, '../../time-client-deploy/dist/');

module.exports = config;