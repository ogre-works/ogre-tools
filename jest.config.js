const path = require('path');
const glob = require('glob');

const getProjectColor = projectNumber => {
  const colors = [
    'red',
    'green',
    'yellow',
    'magenta',
    'cyan',
    'white',
    'redBright',
    'greenBright',
    'yellowBright',
    'blueBright',
    'magentaBright',
    'cyanBright',
    'whiteBright',
  ];

  return colors[projectNumber % colors.length];
};

const toProject = (
  { packageJson, jestConfig, packagePath },
  projectNumber,
) => ({
  rootDir: packagePath,
  displayName: {
    name: packageJson.name,
    color: getProjectColor(projectNumber),
  },
  ...jestConfig,
});

const getProjectConfigs = () => {
  const packageJsonPaths = glob
    .sync('./packages/**/jest.config.js', {
      ignore: '**/node_modules/**',
    })
    .map(filePath => path.dirname(filePath));

  return packageJsonPaths.map(packagePath => ({
    packagePath,
    packageJson: require(`${packagePath}/package.json`),
    jestConfig: require(`${packagePath}/jest.config.js`),
  }));
};

const projectConfigs = getProjectConfigs();

module.exports = {
  projects: projectConfigs.map(toProject),
};
