const { cjsConfig, esmConfig } =
  require('@lensapp/infrastructure-webpack-for-ts');

const overrides = { performance: undefined, externals: [] };

module.exports = [
  { ...cjsConfig, ...overrides },
  { ...esmConfig, ...overrides },
];
