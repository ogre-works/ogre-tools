const { cjsConfig, esmConfig } =
  require('@ogre-tools/infrastructure-webpack-for-ts');

const overrides = { performance: undefined, externals: [] };

module.exports = [
  { ...cjsConfig, ...overrides },
  { ...esmConfig, ...overrides },
];
