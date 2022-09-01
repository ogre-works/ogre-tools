import {
  registrationCallbackToken,
  getInjectable,
  lifecycleEnum,
  deregistrationCallbackToken,
} from '@ogre-tools/injectable';

import { computed, createAtom, runInAction, _getGlobalState } from 'mobx';

export const isInternalOfComputedInjectMany = Symbol(
  'isInternalOfComputedInjectMany',
);

const invalidabilityForReactiveInstances = getInjectable({
  id: 'invalidability-for-reactive-instances',

  instantiate: (_, injectionToken) =>
    createAtom(`reactivity-for-${injectionToken.id}`),

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (_, injectable) => injectable,
  }),

  [isInternalOfComputedInjectMany]: true,

  decorable: false,
});

const getInvalidatorInstance = registerOrDeregister => di => injectable => {
  const { inBatch } = _getGlobalState();

  if (inBatch === 0 && !!injectable.injectionToken) {
    throw new Error(
      `Tried to ${registerOrDeregister} injectable "${injectable.id}" having an injection token outside of MobX-transaction. Transaction is required, as otherwise usages of computedInjectMany could observe untimely invalidations.`,
    );
  }

  if (!injectable.injectionToken) {
    return;
  }

  const mobxAtomForToken = di.inject(
    invalidabilityForReactiveInstances,
    injectable.injectionToken,
  );

  mobxAtomForToken.reportChanged();
};

const invalidateReactiveInstancesOnRegisterCallback = getInjectable({
  id: 'invalidate-reactive-instances-on-register',
  instantiate: getInvalidatorInstance('register'),
  injectionToken: registrationCallbackToken,
  [isInternalOfComputedInjectMany]: true,
  decorable: false,
});

const invalidateReactiveInstancesOnDeregisterCallback = getInjectable({
  id: 'invalidate-reactive-instances-on-deregister',
  instantiate: getInvalidatorInstance('deregister'),
  injectionToken: deregistrationCallbackToken,
  [isInternalOfComputedInjectMany]: true,
  decorable: false,
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
      invalidateReactiveInstancesOnRegisterCallback,
      invalidateReactiveInstancesOnDeregisterCallback,
    );
  });
};
