import {
  deregistrationCallbackToken,
  getInjectable,
  getInjectable2,
  getInjectionToken,
  getInjectionToken2,
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

export const computedInjectMany2InjectionToken = getInjectionToken2({
  id: 'computed-inject-many-2',
});

export const computedInjectManyWithMeta2InjectionToken = getInjectionToken2({
  id: 'computed-inject-many-with-meta-2',
});

export const isInternalOfComputedInjectMany = Symbol(
  'isInternalOfComputedInjectMany',
);

export const atomsByTokenInjectable = getInjectable({
  id: 'atoms-by-token-for-reactive-instances',

  instantiate: () => new Map(),

  [isInternalOfComputedInjectMany]: true,
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
});

export const invalidateReactiveInstancesOnDeregisterCallback = getInjectable({
  id: 'invalidate-reactive-instances-on-deregister',
  instantiate: getInvalidatorInstance,
  injectionToken: deregistrationCallbackToken,
  [isInternalOfComputedInjectMany]: true,
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

// Factory-shape variants: `di.inject(X, token)` returns `(...args) => T[]`
// (the token's ManyFactory). The factory calls `.get()` internally so the
// computation observation flows through whatever reactive context the caller
// is in — autorun, computed, reaction — without per-call `.get()` ceremony.
// These are injectable2 / injectionToken2 so that the `InjectionToken2<F, MF>`
// generics (especially the sibling ManyFactory MF) propagate verbatim.
const computedInjectMany2InjectableFor = ({
  id,
  reactiveInstances,
  injectionToken,
}) =>
  getInjectable2({
    id,

    instantiate:
      di =>
      injectionToken =>
      (...args) =>
        di
          .inject(reactiveInstances)({
            injectionToken,
            args,
          })
          .get(),

    injectionToken,
  });

export const computedInjectMany2Injectable = computedInjectMany2InjectableFor({
  id: 'computed-inject-many-2',
  reactiveInstances: reactiveInstancesInjectable,
  injectionToken: computedInjectMany2InjectionToken,
});

export const computedInjectManyWithMeta2Injectable =
  computedInjectMany2InjectableFor({
    id: 'computed-inject-many-with-meta-2',
    reactiveInstances: reactiveInstancesWithMetaInjectable,
    injectionToken: computedInjectManyWithMeta2InjectionToken,
  });
