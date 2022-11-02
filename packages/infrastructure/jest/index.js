module.exports = rootDir => {
  const shared = {
    transform: {
      '^.+\\.jsx?$': ['babel-jest', { cwd: rootDir }],
      '^.+\\.tsx?$': ['ts-jest', { cwd: rootDir }],
    },

    clearMocks: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'babel',
    coverageReporters: ['lcov'],
    collectCoverage: true,
    testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
    watchPathIgnorePatterns: ['/node_modules/', '/coverage/', '/build/'],

    collectCoverageFrom: [
      '<rootDir>/src/**/*.{js,jsx,ts,tsx}',
      '!<rootDir>/**/*.performance-test.{js,jsx,ts,tsx}',
      '!<rootDir>/**/test-utils/**/*.{js,jsx,ts,tsx}',
    ],

    coverageThreshold: {
      global: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
  };

  const configForNode = {
    ...shared,
    testEnvironment: 'node',
  };

  const configForReact = {
    ...shared,
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: [`${__dirname}/setupReactTests.js`],
  };

  return {
    configForReact,
    configForNode,
  };
};
