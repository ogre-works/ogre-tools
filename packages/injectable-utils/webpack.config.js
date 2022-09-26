const path = require('path');

module.exports = {
  entry: './index.ts',
  target: 'node',
  mode: 'production',

  resolve: {
    extensions: ['.ts', '.js'],
  },

  output: {
    path: path.resolve(process.cwd(), 'build'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },

  node: {
    __dirname: true,
    __filename: true,
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'babel-loader',
        options: { cacheDirectory: true, cacheCompression: false },
      },
    ],
  },
};
