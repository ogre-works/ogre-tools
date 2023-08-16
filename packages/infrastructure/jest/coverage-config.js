module.exports.coverageConfig = {
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['lcov'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/*.test.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/*.performance-test.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/test-utils/**/*',
    // Todo: make "c8 ignore" work also here
    '!<rootDir>/src/**/advanceFakeTime/*',
  ],
};
