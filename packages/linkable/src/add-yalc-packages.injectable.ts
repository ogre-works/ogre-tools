import { getInjectable } from '@ogre-tools/injectable';
import { addPackages } from 'yalc';

export type AddYalcPackages = typeof addPackages;

export const addYalcPackagesInjectable = getInjectable({
  id: 'add-yalc-packages',
  instantiate: (di): AddYalcPackages => addPackages,
});
