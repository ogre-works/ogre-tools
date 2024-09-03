import {
  deregistrationCallbackToken,
  getInjectable,
  lifecycleEnum,
  registrationCallbackToken,
} from '@ogre-tools/injectable';

import { computed, createAtom, runInAction } from 'mobx';
import { getKeyedSingletonCompositeKey } from '@ogre-tools/injectable';

export const isInternalOfComputedInjectMany = Symbol(
  'isInternalOfComputedInjectMany',
);

const invalidabilityForReactiveInstances = getInjectable({
  id: 'invalidability-for-reactive-instances',

  instantiate: (_, injectionToken) =>
    createAtom(`reactivity-for-${injectionToken.id}`),

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (_, injectionToken) => injectionToken,
  }),

  [isInternalOfComputedInjectMany]: true,

  decorable: false,
});

const getInvalidatorInstance = di => injectable => {
  if (!injectable.injectionToken) {
    return;
  }

  getRelatedTokens(injectable.injectionToken)
    .map(token => di.inject(invalidabilityForReactiveInstances, token))
    .forEach(atom => {
      atom.reportChanged();
    });
};

const invalidateReactiveInstancesOnRegisterCallback = getInjectable({
  id: 'invalidate-reactive-instances-on-register',
  instantiate: getInvalidatorInstance,
  injectionToken: registrationCallbackToken,
  [isInternalOfComputedInjectMany]: true,
  decorable: false,
});

const invalidateReactiveInstancesOnDeregisterCallback = getInjectable({
  id: 'invalidate-reactive-instances-on-deregister',
  instantiate: getInvalidatorInstance,
  injectionToken: deregistrationCallbackToken,
  [isInternalOfComputedInjectMany]: true,
  decorable: false,
});

const reactiveInstancesFor = ({ id, methodInDiToInjectMany }) =>
  getInjectable({
    id,

    instantiate: (di, { injectionToken, instantiationParameter }) => {
      const mobxAtomForToken = di.inject(
        invalidabilityForReactiveInstances,
        injectionToken,
      );

      return computed(() => {
        mobxAtomForToken.reportObserved();

        return di[methodInDiToInjectMany](
          injectionToken,
          instantiationParameter,
        );
      });
    },

    lifecycle: lifecycleEnum.keyedSingleton({
      getInstanceKey: (di, { injectionToken, instantiationParameter }) =>
        getKeyedSingletonCompositeKey(injectionToken, instantiationParameter),
    }),

    cannotCauseCycles: true,
  });

const reactiveInstancesInjectable = reactiveInstancesFor({
  id: 'reactive-instances',
  methodInDiToInjectMany: 'injectMany',
});

const reactiveInstancesWithMetaInjectable = reactiveInstancesFor({
  id: 'reactive-instances-with-meta',
  methodInDiToInjectMany: 'injectManyWithMeta',
});

const computedInjectManyInjectableFor = ({ id, reactiveInstances }) =>
  getInjectable({
    id,

    instantiate: di => (injectionToken, instantiationParameter) =>
      di.inject(reactiveInstances, {
        injectionToken,
        instantiationParameter,
      }),

    lifecycle: lifecycleEnum.transient,

    cannotCauseCycles: true,
  });

export const computedInjectManyInjectable = computedInjectManyInjectableFor({
  id: 'computed-inject-many',
  reactiveInstances: reactiveInstancesInjectable,
});

export const computedInjectManyWithMetaInjectable =
  computedInjectManyInjectableFor({
    id: 'computed-inject-many-with-meta',
    reactiveInstances: reactiveInstancesWithMetaInjectable,
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

const getRelatedTokens = token =>
  token === undefined
    ? []
    : [token, ...getRelatedTokens(token.specificTokenOf)];
