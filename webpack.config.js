const path = require('path');

module.exports = {
  entry: './index.js',
  target: 'node',
  mode: 'production',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  output: {
    path: path.resolve(process.cwd(), 'build'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },

  externals: ['mobx', 'mobx-react', 'react'],

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
