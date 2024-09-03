module.exports.coverageConfig = {
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['lcov'],
  collectCoverage: true,
  // Todo: fix false-negative coverage reporting, and restore coverageThreshold.
  // coverageThreshold: {
  //   global: {
  //     branches: 100,
  //     functions: 100,
  //     lines: 100,
  //     statements: 100,
  //   },
  // },
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/*.d.{ts,tsx}',
    '!<rootDir>/src/**/*.{test-d,test}.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/*.performance-test.{js,jsx,ts,tsx}',
    '!<rootDir>/src/**/test-utils/**/*',
    // Todo: make "c8 ignore" work also here
    '!<rootDir>/src/**/advanceFakeTime/*',
  ],
};
