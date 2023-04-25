import { getInjectable } from '@ogre-tools/injectable';
import { workingDirectoryInjectable } from '../shared/working-directory.injectable';
import type { Config } from '../config/get-config.injectable';
import { pipeline } from '@ogre-tools/fp';
import { map, flatten } from 'lodash/fp';
import { globInjectable } from '../shared/fs/glob.injectable';
import { awaitAll } from '../await-all';

export const getPackageJsonPathsInjectable = getInjectable({
  id: 'get-package-json-paths',

  instantiate: di => {
    const workingDirectory = di.inject(workingDirectoryInjectable);
    const glob = di.inject(globInjectable);

    return (config: Config) =>
      pipeline(
        config,

        map(modulePathGlob =>
          glob(`${modulePathGlob}/package.json`, {
            cwd: workingDirectory,
            ignore: ['**/node_modules/**/*'],
            absolute: true,
          }),
        ),

        awaitAll,

        flatten,
      );
  },
});
