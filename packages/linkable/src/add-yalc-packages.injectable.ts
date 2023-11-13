import { getInjectable } from '@lensapp/injectable';
import { addPackages } from 'yalc';

export type AddYalcPackages = typeof addPackages;

export const addYalcPackagesInjectable = getInjectable({
  id: 'add-yalc-packages',
  instantiate:
    /* c8 ignore next */
    (): AddYalcPackages => addPackages,
});
