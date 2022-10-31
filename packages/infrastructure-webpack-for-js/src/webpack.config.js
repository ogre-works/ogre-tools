const path = require('path');

const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './index.js',
  target: 'node',
  mode: 'production',

  performance: {
    maxEntrypointSize: 10000,
    hints: 'error',
  },

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  output: {
    path: path.resolve(process.cwd(), 'build'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },

  externals: [nodeExternals({ modulesFromFile: true })],
  externalsPresets: { node: true },

  node: {
    __dirname: true,
    __filename: true,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: { cacheDirectory: true, cacheCompression: false },
      },
    ],
  },
};
