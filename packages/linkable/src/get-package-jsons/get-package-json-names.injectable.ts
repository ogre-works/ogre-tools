import { awaitAll } from '../await-all';
import { pipeline } from '@ogre-tools/fp';
import { map } from 'lodash/fp';
import { getInjectable } from '@ogre-tools/injectable';
import { readJsonFileInjectable } from '../shared/fs/read-json-file.injectable';
import { getPackageJsonPathsInjectable } from './get-package-json-paths.injectable';
import type { Config } from '../config/get-config.injectable';

export const getPackageJsonNamesInjectable = getInjectable({
  id: 'get-package-json-names',

  instantiate: di => {
    const readJsonFile = di.inject(readJsonFileInjectable);
    const getPackageJsonPaths = di.inject(getPackageJsonPathsInjectable);

    return async (config: Config) => {
      const packageJsonPaths = await getPackageJsonPaths(config);

      return pipeline(
        packageJsonPaths,

        map(
          async packageJsonPath =>
            ((await readJsonFile(packageJsonPath)) as { name: string }).name,
        ),

        awaitAll,
      );
    };
  },
});
