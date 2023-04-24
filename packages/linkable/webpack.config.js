const webpackConfig =
  require('@ogre-tools/infrastructure-webpack-for-ts').webpackConfig;

const ShebangPlugin = require('webpack-shebang-plugin');

module.exports = {
  ...webpackConfig,
  performance: undefined,
  plugins: [...(webpackConfig.plugins || []), new ShebangPlugin()],
};
