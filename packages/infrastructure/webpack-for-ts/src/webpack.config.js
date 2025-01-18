const {
  webpackConfig: configForJs,
} = require('@lensapp/infrastructure-webpack-for-js');

module.exports = {
  ...configForJs,
  entry: './index.ts',

  resolve: {
    extensions: ['.ts', '.tsx', ...configForJs.resolve.extensions],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },

      ...configForJs.module.rules,
    ],
  },
};
