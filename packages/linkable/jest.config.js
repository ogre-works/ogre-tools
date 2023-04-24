const config = require('@ogre-tools/infrastructure-jest').monorepoPackageConfig(
  __dirname,
).configForNode;

module.exports = {
  ...config,
  // Todo: make stuff like "/* c8 ignore next */" work, and use that instead.
  coverageThreshold: undefined,
};
