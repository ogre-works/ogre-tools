import {
  deregistrationCallbackToken,
  getInjectable,
  lifecycleEnum,
  registrationCallbackToken,
} from '@ogre-tools/injectable';

import { computed, createAtom, runInAction } from 'mobx';

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

export const computedInjectManyWithMetaInjectable = getInjectable({
  id: 'computed-inject-many-with-meta',

  instantiate: di => injectionToken =>
    di.inject(reactiveInstancesWithMetaInjectable, injectionToken),

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

const reactiveInstancesWithMetaInjectable = getInjectable({
  id: 'reactive-instances-with-meta',

  instantiate: (di, injectionToken) => {
    const mobxAtomForToken = di.inject(
      invalidabilityForReactiveInstances,
      injectionToken,
    );

    return computed(() => {
      mobxAtomForToken.reportObserved();

      return di.injectManyWithMeta(injectionToken);
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
      reactiveInstancesWithMetaInjectable,
      computedInjectManyInjectable,
      computedInjectManyWithMetaInjectable,
      invalidateReactiveInstancesOnRegisterCallback,
      invalidateReactiveInstancesOnDeregisterCallback,
    );
  });
};
