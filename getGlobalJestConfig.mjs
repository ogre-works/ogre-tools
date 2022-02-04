export default () => ({
  watchPathIgnorePatterns: ['/node_modules/', '/coverage/', '/build/'],
  moduleNameMapper: {
    '@ogre-tools/(.*)': `<rootDir>/../$1/index.js`,
  },
});
