// production config
const { merge } = require('webpack-merge');
const { resolve } = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const path = require('path');

const commonConfig = require('./common');

//Loads .env.local file and injects environment variables
dotenv.config({
    path: path.resolve(__dirname, '../../.env.prod'),
});

module.exports = merge(commonConfig, {
    mode: 'production',
    entry: './index.tsx',
    output: {
        filename: 'js/bundle.[contenthash].min.js',
        path: resolve(__dirname, '../../dist'),
        publicPath: '/',
    },
    devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin({
            IS_DEBUG: process.env.IS_DEBUG,
            USE_TINYLICIOUS: process.env.USE_TINYLICIOUS,
            APP_ID: JSON.stringify(process.env.APP_ID),
            AUTHORITY_URI: JSON.stringify(process.env.AUTHORITY_URI),
            PAINT_METAOS_APP_ID: JSON.stringify(process.env.PAINT_METAOS_ID),
            GRAPH_SCOPES: process.env.GRAPH_SCOPES,
            'process.env': {}, //Polyfill for node variable (Used by Fluid)
        }),
    ],
});
