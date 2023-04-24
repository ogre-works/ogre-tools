import { ensureEmptyLinkDirectoriesInjectable } from './ensure-empty-link-directories/ensure-empty-link-directories.injectable';
import { getPackageJsonsInjectable } from './get-package-jsons/get-package-jsons.injectable';
import { getInjectable } from '@ogre-tools/injectable';
import { createSymlinksInjectable } from './create-symlinks/create-symlinks.injectable';
import getConfigInjectable from './config/get-config.injectable';
import createEmptyConfigInjectable from './config/create-empty-config.injectable';
import { PackageJsonAndPath } from './shared/package-json-and-path';

export type CreateLinks = () => Promise<void>;

export const createLinksInjectable = getInjectable({
  id: 'create-links',

  instantiate: (di): CreateLinks => {
    const getPackageJsons = di.inject(getPackageJsonsInjectable);
    const ensureEmptyLinkDirectories = di.inject(
      ensureEmptyLinkDirectoriesInjectable,
    );
    const createSymlinks = di.inject(createSymlinksInjectable);
    const getConfig = di.inject(getConfigInjectable);
    const createEmptyConfig = di.inject(createEmptyConfigInjectable);

    return async () => {
      const config = await getConfig();

      if (!config) {
        await createEmptyConfig();

        return;
      }

      const packageJsons = await getPackageJsons(config);

      checkForMissingPropertyForFiles(packageJsons);

      await ensureEmptyLinkDirectories(packageJsons);
      await createSymlinks(packageJsons);
    };
  },
});

const checkForMissingPropertyForFiles = (
  packageJsons: PackageJsonAndPath[],
) => {
  const bad = packageJsons
    .filter(x => x.content.files === undefined)
    .map(x => x.packageJsonPath);

  if (bad.length) {
    throw new Error(
      `Tried create links of linkable, but some package.jsons didn't specify property "files": "${bad.join(
        '", "',
      )}"`,
    );
  }
};
