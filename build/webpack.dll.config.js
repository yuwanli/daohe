/**
 * lip.fan
 * 预编译
 */
const webpack = require('webpack')
const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  output: {
    path: path.resolve(__dirname, '../dist/assets_daohe/dll'),
    filename: '[name].dll-[hash].js',
    library: '[name]'
  },
  entry: {
    vendor: ['xtemplate', 'es6-promise', '@base/lazyload', '@base/env']
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new CleanWebpackPlugin(['assets_daohe/dll'], {
      root: path.resolve('./dist')
    }),
    new webpack.DllPlugin({
      path: path.join(
        __dirname,
        '../dist/assets_daohe',
        '[name]-manifest.json'
      ),
      name: '[name]'
    })
  ]
}
