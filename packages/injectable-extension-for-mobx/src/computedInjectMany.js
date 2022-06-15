import {
  getInjectable,
  lifecycleEnum,
  registrationDecoratorToken,
  deregistrationDecoratorToken,
} from '@ogre-tools/injectable';

import { computed, createAtom, runInAction } from 'mobx';
import { pipeline } from '@ogre-tools/fp';
import { filter, forEach } from 'lodash/fp';

const invalidabilityForReactiveInstances = getInjectable({
  id: 'invalidability-for-reactive-instances',

  instantiate: (_, injectionToken) =>
    createAtom(`reactivity-for-${injectionToken.id}`),

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (_, injectable) => injectable,
  }),
});

const getInvalidatorInstance =
  di =>
  registerToBeDecorated =>
  (...injectables) => {
    const registered = registerToBeDecorated(...injectables);

    runInAction(() => {
      pipeline(
        injectables,
        filter(injectable => !!injectable.injectionToken),

        forEach(({ injectionToken }) => {
          const mobxAtomForToken = di.inject(
            invalidabilityForReactiveInstances,
            injectionToken,
          );

          mobxAtomForToken.reportChanged();
        }),
      );
    });

    return registered;
  };

const invalidateReactiveInstancesOnRegisterDecorator = getInjectable({
  id: 'invalidate-reactive-instances-on-register',

  instantiate: getInvalidatorInstance,

  injectionToken: registrationDecoratorToken,
});

const invalidateReactiveInstancesOnDeregisterDecorator = getInjectable({
  id: 'invalidate-reactive-instances-on-deregister',

  instantiate: getInvalidatorInstance,

  injectionToken: deregistrationDecoratorToken,
});

export const computedInjectManyInjectable = getInjectable({
  id: 'computed-inject-many',

  instantiate: di => {
    const getReactiveInstances = injectionToken =>
      di.inject(reactiveInstancesInjectable, injectionToken);

    return injectionToken => {
      return getReactiveInstances(injectionToken);
    };
  },
});

const reactiveInstancesInjectable = getInjectable({
  id: 'reactive-instances',

  instantiate: (di, injectionToken) => {
    const mobxAtomForToken = di.inject(
      invalidabilityForReactiveInstances,
      injectionToken,
    );

    return computed(() => {
      mobxAtomForToken.reportObserved();

      return di.injectMany(injectionToken);
    });
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, injectionToken) => injectionToken,
  }),
});

export const registerMobX = di => {
  di.register(
    invalidateReactiveInstancesOnRegisterDecorator,
    invalidateReactiveInstancesOnDeregisterDecorator,
    computedInjectManyInjectable,
    invalidabilityForReactiveInstances,
    reactiveInstancesInjectable,
  );
};
