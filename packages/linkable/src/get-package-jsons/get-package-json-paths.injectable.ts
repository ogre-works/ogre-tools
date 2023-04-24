import { getInjectable } from '@ogre-tools/injectable';
import { resolvePathInjectable } from '../shared/path/resolve-path.injectable';
import { workingDirectoryInjectable } from '../shared/working-directory.injectable';
import type { Config } from '../config/get-config.injectable';

export const getPackageJsonPathsInjectable = getInjectable({
  id: 'get-package-json-paths',

  instantiate: di => {
    const resolvePath = di.inject(resolvePathInjectable);
    const workingDirectory = di.inject(workingDirectoryInjectable);

    return (config: Config) =>
      config.map((linkPath: string) =>
        resolvePath(workingDirectory, linkPath, 'package.json'),
      );
  },
});
