'use strict';
const merge = require('webpack-merge');
const prodEnv = require('./prod.env');

module.exports = merge(prodEnv, {
    NODE_ENV: '"development"',
    httpClientBaseURL: '"http://localhost:3000/"',
    gameClientAssetsBaseURL: '"/static"',
    gameClientBaseURL: '"/static"', // legacy for game-old project
    gameClientNetwork: {
        hostname: '"localhost"',
        path: '"/gameserver/"',
        port: 8000,
        secure: false
    },
    gameSocketFramework: '"sc"'
});