const {
  webpackConfig: configForJs,
} = require('@ogre-tools/infrastructure-webpack-for-js');

module.exports = {
  ...configForJs,
  entry: './index.ts',

  resolve: {
    extensions: ['.ts', ...configForJs.resolve.extensions],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },

      ...configForJs.module.rules,
    ],
  },
};
