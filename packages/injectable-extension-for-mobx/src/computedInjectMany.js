import {
  deregistrationDecoratorToken,
  getInjectable,
  lifecycleEnum,
  registrationDecoratorToken,
} from '@ogre-tools/injectable';

import { computed, createAtom, runInAction, _getGlobalState } from 'mobx';

const invalidabilityForReactiveInstances = getInjectable({
  id: 'invalidability-for-reactive-instances',

  instantiate: (_, injectionToken) =>
    createAtom(`reactivity-for-${injectionToken.id}`),

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (_, injectable) => injectable,
  }),
});

const getInvalidatorInstance =
  registerOrDeregister => di => registerToBeDecorated => injectable => {
    const { inBatch } = _getGlobalState();

    if (inBatch === 0 && !!injectable.injectionToken) {
      throw new Error(
        `Tried to ${registerOrDeregister} injectable "${injectable.id}" having an injection token outside of MobX-transaction. Transaction is required, as otherwise usages of computedInjectMany could observe untimely invalidations.`,
      );
    }

    registerToBeDecorated(injectable);

    if (!injectable.injectionToken) {
      return;
    }

    const mobxAtomForToken = di.inject(
      invalidabilityForReactiveInstances,
      injectable.injectionToken,
    );

    mobxAtomForToken.reportChanged();
  };

const invalidateReactiveInstancesOnRegisterDecorator = getInjectable({
  id: 'invalidate-reactive-instances-on-register',

  instantiate: getInvalidatorInstance('register'),

  injectionToken: registrationDecoratorToken,
});

const invalidateReactiveInstancesOnDeregisterDecorator = getInjectable({
  id: 'invalidate-reactive-instances-on-deregister',

  instantiate: getInvalidatorInstance('deregister'),

  injectionToken: deregistrationDecoratorToken,
});

export const computedInjectManyInjectable = getInjectable({
  id: 'computed-inject-many',

  instantiate: di => injectionToken =>
    di.inject(reactiveInstancesInjectable, injectionToken),

  lifecycle: lifecycleEnum.transient,

  cannotCauseCycles: true,
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

  cannotCauseCycles: true,
});

export const registerMobX = di => {
  runInAction(() => {
    di.register(
      invalidabilityForReactiveInstances,
      reactiveInstancesInjectable,
      computedInjectManyInjectable,
      invalidateReactiveInstancesOnRegisterDecorator,
      invalidateReactiveInstancesOnDeregisterDecorator,
    );
  });
};
