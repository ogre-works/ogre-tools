import {
  getInjectable,
  lifecycleEnum,
  registrationDecoratorToken,
} from '@ogre-tools/injectable';

import { computed, createAtom, runInAction } from 'mobx';

const invalidabilityForReactiveInstances = getInjectable({
  id: 'invalidability-for-reactive-instances',

  instantiate: (_, injectionToken) =>
    createAtom(`reactivity-for-${injectionToken.id}`),

  adHoc: true,

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (_, injectable) => injectable,
  }),
});

const invalidateReactiveInstancesOnRegisterDecorator = getInjectable({
  id: 'invalidate-reactive-instances-on-register',

  instantiate:
    di =>
    registerToBeDecorated =>
    (injectable, ...args) => {
      const registered = registerToBeDecorated(injectable, ...args);

      if (injectable.injectionToken) {
        const mobxAtomForToken = di.inject(
          invalidabilityForReactiveInstances,
          injectable.injectionToken,
        );

        runInAction(() => {
          mobxAtomForToken.reportChanged();
        });
      }

      return registered;
    },

  injectionToken: registrationDecoratorToken,
});

export const registerMobX = di => {
  di.register(invalidateReactiveInstancesOnRegisterDecorator);
};

export const reactiveInstancesInjectable = getInjectable({
  id: 'reactive-instances',

  instantiate: (di, { injectionToken }) =>
    computed(() => {
      const mobxAtomForToken = di.inject(
        invalidabilityForReactiveInstances,
        injectionToken,
      );

      mobxAtomForToken.reportObserved();

      return di.injectMany(injectionToken);
    }),

  adHoc: true,

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (_, injectable) => injectable,
  }),
});
