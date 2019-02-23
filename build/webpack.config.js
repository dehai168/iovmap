const path = require('path');
const webpack = require('webpack');
module.exports = {
    mode: 'production',
    entry: ['./index.js'],
    output: {
        publicPath: 'dist/',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        filename: 'iovmap.min.js',
        path: path.resolve(__dirname, '../dist')
    },
    devServer: {
        contentBase: './docs'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader'
        }, {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }, {
            test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
            use: 'url-loader?limit=1024'
        },]
    },
    optimization: {
        minimize: true
    }
}