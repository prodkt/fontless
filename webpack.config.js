const path = require('path');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    app: './src/app.ts',
    worker: './src/worker.ts'
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "fs": false,
      "path": require.resolve("path-browserify")
    }
  },
  module: {
    rules: [
      { 
        test: /\.ts$/, 
        use: 'ts-loader' 
      },
      {
        test: /ffi\.js$/,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]'
        }
      },
      {
        test: /\.wasm$/,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]'
        }
      }
    ]
  },
  plugins: [
    new WorkboxPlugin.GenerateSW({
      swDest: path.resolve(__dirname, 'public/service-worker.js'),
      runtimeCaching: [
        {
          urlPattern: /\.(?:wasm|js|html|css)$/,
          handler: 'NetworkOnly'
        }
      ]
    })
  ],
};