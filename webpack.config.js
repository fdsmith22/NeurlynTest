const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './js/neurlyn-integrated.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.[contenthash].js',
    clean: true,
    publicPath: process.env.BASE_URL || '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      inject: false // Don't auto-inject, we'll load our module directly
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'styles', to: 'styles' },
        { from: 'assets', to: 'assets' },
        { from: 'js/neurlyn-integrated.js', to: 'js/neurlyn-integrated.js' },
        { from: 'js/report-generator.js', to: 'js/report-generator.js' },
        { from: 'js/modules', to: 'js/modules' },
        { from: 'js/tasks', to: 'js/tasks' },
        { from: 'js/questions', to: 'js/questions' },
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'backend.js', to: 'backend.js' },
        { from: 'about.html', to: 'about.html' },
        { from: 'support.html', to: 'support.html' }
      ]
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    compress: true,
    port: 3001,
    hot: true,
    open: true
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
