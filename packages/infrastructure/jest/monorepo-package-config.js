const { coverageConfig } = require('./coverage-config');

module.exports = rootDir => {
  const shared = {
    transform: {
      '^.+\\.(t|j)sx?$': ['@swc/jest', { cwd: rootDir }],
    },

    clearMocks: true,
    testMatch: ['**/?(*.)+(test).{js,ts,tsx}'],
    watchPathIgnorePatterns: ['/node_modules/', '/coverage/', '/build/'],

    moduleNameMapper: {
      '^electron$': 'identity-obj-proxy',
    },

    ...coverageConfig,
  };

  const configForNode = {
    ...shared,
    testEnvironment: 'node',
  };

  const configForReact = {
    ...shared,

    moduleNameMapper: {
      '\\.(css|scss)$': 'identity-obj-proxy',
      ...shared.moduleNameMapper,
    },

    testEnvironment: 'jsdom',
    setupFilesAfterEnv: [`${__dirname}/setupReactTests.js`],
  };

  return {
    configForReact,
    configForNode,
  };
};
