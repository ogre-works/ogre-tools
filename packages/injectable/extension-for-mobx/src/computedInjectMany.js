import {
  deregistrationCallbackToken,
  getInjectable,
  getInjectionToken,
  getKeyedSingletonCompositeKey,
  lifecycleEnum,
  registrationCallbackToken,
} from '@ogre-tools/injectable';

import { computed, createAtom } from 'mobx';

export const computedInjectManyInjectionToken = getInjectionToken({
  id: 'computed-inject-many',
});

export const computedInjectManyWithMetaInjectionToken = getInjectionToken({
  id: 'computed-inject-many-with-meta',
});

export const isInternalOfComputedInjectMany = Symbol(
  'isInternalOfComputedInjectMany',
);

export const atomsByTokenInjectable = getInjectable({
  id: 'atoms-by-token-for-reactive-instances',

  instantiate: () => new Map(),

  [isInternalOfComputedInjectMany]: true,

  decorable: false,
});

const getInvalidatorInstance = di => {
  const atomsByToken = di.inject(atomsByTokenInjectable);

  return injectable => {
    let token = injectable.injectionToken;

    while (token !== undefined) {
      const atom = atomsByToken.get(token);
      if (atom !== undefined) atom.reportChanged();
      token = token.specificTokenOf;
    }
  };
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

    instantiate: (di, { injectionToken, args }) => {
      const atomsByToken = di.inject(atomsByTokenInjectable);
      let mobxAtomForToken = atomsByToken.get(injectionToken);

      if (mobxAtomForToken === undefined) {
        mobxAtomForToken = createAtom(`reactivity-for-${injectionToken.id}`);
        atomsByToken.set(injectionToken, mobxAtomForToken);
      }

      return computed(() => {
        mobxAtomForToken.reportObserved();

        return di[methodInDiToInjectMany](injectionToken, ...args);
      });
    },

    lifecycle: lifecycleEnum.keyedSingleton({
      getInstanceKey: (di, { injectionToken, args }) =>
        getKeyedSingletonCompositeKey(injectionToken, ...args),
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

    instantiate:
      di =>
      (injectionToken, ...args) =>
        di.inject(reactiveInstances, {
          injectionToken,
          args,
        }),

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
