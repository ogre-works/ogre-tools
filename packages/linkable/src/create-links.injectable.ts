import { getPackageJsonNamesInjectable } from './get-package-jsons/get-package-json-names.injectable';
import { getInjectable } from '@ogre-tools/injectable';
import getConfigInjectable from './config/get-config.injectable';
import createEmptyConfigInjectable from './config/create-empty-config.injectable';
import { addYalcPackagesInjectable } from './add-yalc-packages.injectable';
import { workingDirectoryInjectable } from './shared/working-directory.injectable';

export type CreateLinks = () => Promise<void>;

export const createLinksInjectable = getInjectable({
  id: 'create-links',

  instantiate: (di): CreateLinks => {
    const getPackageJsonNames = di.inject(getPackageJsonNamesInjectable);
    const getConfig = di.inject(getConfigInjectable);
    const createEmptyConfig = di.inject(createEmptyConfigInjectable);
    const addYalcPackages = di.inject(addYalcPackagesInjectable);
    const workingDirectory = di.inject(workingDirectoryInjectable);

    return async () => {
      const config = await getConfig();

      if (!config) {
        await createEmptyConfig();

        return;
      }

      const names = await getPackageJsonNames(config);

      if (!names.length) {
        return;
      }

      await addYalcPackages(names, {
        link: true,
        workingDir: workingDirectory,
      });
    };
  },
});
