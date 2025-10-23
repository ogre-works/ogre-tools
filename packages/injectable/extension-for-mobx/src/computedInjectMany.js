import {
  deregistrationCallbackToken,
  getInjectable,
  getInjectionToken,
  getKeyedSingletonCompositeKey,
  lifecycleEnum,
  registrationCallbackToken,
} from '@lensapp/injectable';

import { computed, createAtom, runInAction } from 'mobx';

export const computedInjectManyInjectionToken = getInjectionToken({
  id: 'computed-inject-many',
});

export const computedInjectManyWithMetaInjectionToken = getInjectionToken({
  id: 'computed-inject-many-with-meta',
});

export const isInternalOfComputedInjectMany = Symbol(
  'isInternalOfComputedInjectMany',
);

export const invalidabilityForReactiveInstances = getInjectable({
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

export const invalidateReactiveInstancesOnRegisterCallback = getInjectable({
  id: 'invalidate-reactive-instances-on-register',
  instantiate: getInvalidatorInstance,
  injectionToken: registrationCallbackToken,
  [isInternalOfComputedInjectMany]: true,
  decorable: false,
});

export const invalidateReactiveInstancesOnDeregisterCallback = getInjectable({
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
  });

export const reactiveInstancesInjectable = reactiveInstancesFor({
  id: 'reactive-instances',
  methodInDiToInjectMany: 'injectMany',
});

export const reactiveInstancesWithMetaInjectable = reactiveInstancesFor({
  id: 'reactive-instances-with-meta',
  methodInDiToInjectMany: 'injectManyWithMeta',
});

const computedInjectManyInjectableFor = ({
  id,
  reactiveInstances,
  injectionToken,
}) =>
  getInjectable({
    id,

    instantiate: di => (injectionToken, instantiationParameter) =>
      di.inject(reactiveInstances, {
        injectionToken,
        instantiationParameter,
      }),

    lifecycle: lifecycleEnum.transient,
    injectionToken,
  });

export const computedInjectManyInjectable = computedInjectManyInjectableFor({
  id: 'computed-inject-many',
  reactiveInstances: reactiveInstancesInjectable,
  injectionToken: computedInjectManyInjectionToken,
});

export const computedInjectManyWithMetaInjectable =
  computedInjectManyInjectableFor({
    id: 'computed-inject-many-with-meta',
    reactiveInstances: reactiveInstancesWithMetaInjectable,
    injectionToken: computedInjectManyWithMetaInjectionToken,
  });

const getRelatedTokens = token =>
  token === undefined
    ? []
    : [token, ...getRelatedTokens(token.specificTokenOf)];
