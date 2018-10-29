const path = require('path');
const webpack = require('webpack');
module.exports = {
    mode: 'production',
    entry: ['./src/index.js'],
    output: {
        libraryTarget: 'umd',
        umdNamedDefine: true,
        filename: 'hmap.min.js',
        path: path.resolve(__dirname, '../dist')
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader'
        }]
    },
    optimization: {
        minimize: true
    }
}