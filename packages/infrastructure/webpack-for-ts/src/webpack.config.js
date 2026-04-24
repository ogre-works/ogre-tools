const {
  cjsConfig: cjsConfigForJs,
  esmConfig: esmConfigForJs,
} = require('@lensapp/infrastructure-webpack-for-js');

const withTypeScript = (baseConfig, tsLoaderOptions = {}) => ({
  ...baseConfig,
  entry: './index.ts',

  resolve: {
    extensions: ['.ts', '.tsx', ...baseConfig.resolve.extensions],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        ...(Object.keys(tsLoaderOptions).length > 0
          ? { options: tsLoaderOptions }
          : {}),
      },

      ...baseConfig.module.rules,
    ],
  },
});

const cjsConfig = withTypeScript(cjsConfigForJs);
const esmConfig = withTypeScript(esmConfigForJs, { transpileOnly: true });

module.exports = { cjsConfig, esmConfig };
