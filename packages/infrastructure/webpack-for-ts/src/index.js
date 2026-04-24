const { cjsConfig, esmConfig } = require('./webpack.config');

module.exports = {
  webpackConfig: [cjsConfig, esmConfig],
  cjsConfig,
  esmConfig,
};
