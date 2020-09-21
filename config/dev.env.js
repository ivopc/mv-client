'use strict';
const merge = require('webpack-merge');
const prodEnv = require('./prod.env');

module.exports = merge(prodEnv, {
    NODE_ENV: '"development"',
    baseURL: '"http://localhost:3000/"',
    gameClientBaseURL: '"/static"'
})