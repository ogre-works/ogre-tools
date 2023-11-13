import { getInjectable } from '@lensapp/injectable';
import { workingDirectoryInjectable } from '../shared/working-directory.injectable';
import type { Config } from '../config/get-config.injectable';
import { pipeline } from '@lensapp/fp';
import { map, flatMap, tap } from 'lodash/fp';
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

        map(async modulePathGlob => {
          const globString = `${modulePathGlob}/package.json`;

          return {
            globString: globString,

            packageJsonPaths: await glob(globString, {
              cwd: workingDirectory,
              ignore: ['**/node_modules/**/*'],
              absolute: true,
            }),
          };
        }),

        awaitAll,

        tap(checkForGlobMatchesFor(workingDirectory)),

        flatMap('packageJsonPaths'),
      );
  },
});

const checkForGlobMatchesFor =
  (workingDirectory: string) =>
  (results: { globString: string; packageJsonPaths: any[] }[]) => {
    const globStringsForNoMatches = results
      .filter(x => !x.packageJsonPaths.length)
      .map(x => x.globString);

    if (globStringsForNoMatches.length) {
      throw new Error(
        `Tried to linkable-link: "${globStringsForNoMatches.join(
          '", "',
        )}" from "${workingDirectory}/.linkable.json", but no package.jsons were found.`,
      );
    }
  };
