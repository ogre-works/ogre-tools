import { getInjectable } from '@ogre-tools/injectable';
import { publishPackage } from 'yalc';

export type PublishYalcPackage = typeof publishPackage;

export const publishYalcPackageInjectable = getInjectable({
  id: 'publish-yalc-package',
  instantiate:
    /* c8 ignore next */
    (): PublishYalcPackage => publishPackage,
});
