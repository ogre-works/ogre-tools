import { nonStoredInstanceKey, storedInstanceKey } from './lifecycleEnum';
import { withInstantiationDecoratorsFor } from './withInstantiationDecoratorsFor';
import { isCompositeKey } from '../getCompositeKey/getCompositeKey';
import { injectableSymbol2 } from '../getInjectable2/getInjectable2';

// Pre-allocated key for singleton instance lookup — avoids array creation per inject()
const singletonCompositeKey = [storedInstanceKey];

export const privateInjectFor =
  ({
    getRelatedInjectables,
    alreadyInjected,
    overridingInjectables,
    instancesByInjectableMap,
    getDi,
    checkForNoMatches,
    checkForTooManyMatches,
    checkForSideEffects,
    checkForAbstractToken,
    namespacedIdByInjectableMap,
    getNamespacedId,
  }) =>
  ({ withMeta }) =>
  ({ alias, instantiationParameters, injectingInjectable }) => {
    checkForAbstractToken(alias, injectingInjectable);

    const di = getDi();

    const relatedInjectables = getRelatedInjectables(alias);

    checkForTooManyMatches(relatedInjectables, alias, injectingInjectable);
    checkForNoMatches(relatedInjectables, alias, injectingInjectable);

    const originalInjectable = relatedInjectables[0];

    alreadyInjected.add(originalInjectable);

    const overriddenInjectable = overridingInjectables.get(originalInjectable);

    const injectable = overriddenInjectable || originalInjectable;

    checkForSideEffects(injectable, injectingInjectable);

    // Backward compat: old-style singletons tolerated `inject(alias, undefined)`.
    // Normalize all-undefined args to [] so fast-path and singleton guard behave
    // as if no parameter was supplied.
    if (
      injectable.aliasType !== injectableSymbol2 &&
      injectable.lifecycle.id === 'singleton' &&
      instantiationParameters.length > 0 &&
      instantiationParameters.every(p => p === undefined)
    ) {
      instantiationParameters = [];
    }

    // Fast path: singleton cache hit — avoid creating minimalDi entirely.
    if (instantiationParameters.length === 0) {
      const instanceMap = instancesByInjectableMap.get(
        injectable.overriddenInjectable || injectable,
      );

      const existingInstance = instanceMap.get(singletonCompositeKey);

      if (existingInstance) {
        if (!withMeta) {
          return existingInstance;
        }

        return {
          instance: existingInstance,
          meta: { id: namespacedIdByInjectableMap.get(injectable) },
        };
      }
    }

    const instance = getInstance(
      di,
      injectable,
      instantiationParameters,
      instancesByInjectableMap,
      injectingInjectable,
      namespacedIdByInjectableMap,
      getNamespacedId,
    );

    if (!withMeta) {
      return instance;
    }

    return {
      instance,
      meta: { id: namespacedIdByInjectableMap.get(injectable) },
    };
  };

const createMinimalDi = (
  di,
  injectableToBeInstantiated,
  injectingInjectable,
  namespacedIdByInjectableMap,
) => {
  const shared = {
    register: (...injectables) => {
      di.register({
        injectables,
        context: [{ injectable: injectableToBeInstantiated }],
        source: injectableToBeInstantiated,
      });
    },

    deregister: (...injectables) => {
      di.deregister({
        injectables,
        context: [{ injectable: injectableToBeInstantiated }],
        source: injectableToBeInstantiated,
      });
    },

    get sourceNamespace() {
      const nsId = namespacedIdByInjectableMap.get(injectingInjectable);
      const lastColon = nsId ? nsId.lastIndexOf(':') : -1;

      return lastColon > 0 ? nsId.slice(0, lastColon) : undefined;
    },

    hasRegistrations: di.hasRegistrations,
    getNumberOfInstances: di.getNumberOfInstances,

    purge: (alias, ...keyParts) =>
      di.scopedPurge(injectableToBeInstantiated, alias, ...keyParts),
  };

  // Unified shape for both v1 and v2:
  //   inject/injectMany return instances (variadic params passed inline).
  //   inject2/injectMany2 return factories (for v2 aliases the native factory, generics preserved;
  //   for v1 aliases a synthesized (...p) => instance wrapper).
  const minimalInject = (alias, ...args) =>
    di.inject({
      alias,
      instantiationParameters: args,
      injectingInjectable: injectableToBeInstantiated,
    });

  const minimalInjectMany = (alias, ...args) =>
    di.injectMany({
      alias,
      instantiationParameters: args,
      injectingInjectable: injectableToBeInstantiated,
    });

  const minimalInjectWithMeta = (alias, ...args) =>
    di.injectWithMeta({
      alias,
      instantiationParameters: args,
      injectingInjectable: injectableToBeInstantiated,
    });

  const minimalInjectManyWithMeta = (alias, ...args) =>
    di.injectManyWithMeta({
      alias,
      instantiationParameters: args,
      injectingInjectable: injectableToBeInstantiated,
    });

  return {
    ...shared,

    inject: minimalInject,
    injectMany: minimalInjectMany,
    injectWithMeta: minimalInjectWithMeta,
    injectManyWithMeta: minimalInjectManyWithMeta,

    inject2:
      alias =>
      (...params) =>
        minimalInject(alias, ...params),

    injectMany2:
      alias =>
      (...params) =>
        minimalInjectMany(alias, ...params),

    injectWithMeta2:
      alias =>
      (...params) =>
        minimalInjectWithMeta(alias, ...params),

    injectManyWithMeta2:
      alias =>
      (...params) =>
        minimalInjectManyWithMeta(alias, ...params),

    injectFactory:
      alias =>
      (...params) =>
        minimalInject(alias, ...params),
  };
};

const instantiate = (
  di,
  injectableToBeInstantiated,
  minimalDi,
  instantiationParameters,
) => {
  const withInstantiationDecorators = withInstantiationDecoratorsFor({
    injectMany: di.injectMany,
    injectable: injectableToBeInstantiated,
  });

  const decorated = withInstantiationDecorators(
    injectableToBeInstantiated.instantiate,
  );

  // New-style injectable2: curried (di) => (...params) => instance
  if (injectableToBeInstantiated.aliasType === injectableSymbol2) {
    return decorated(minimalDi)(...instantiationParameters);
  }

  // Old-style: (di, ...params) => instance
  return decorated(minimalDi, ...instantiationParameters);
};

const getInstance = (
  di,
  injectableToBeInstantiated,
  instantiationParameters,
  instancesByInjectableMap,
  injectingInjectable,
  namespacedIdByInjectableMap,
  getNamespacedId,
) => {
  const instanceMap = instancesByInjectableMap.get(
    injectableToBeInstantiated.overriddenInjectable ||
      injectableToBeInstantiated,
  );

  const lifecycleId = injectableToBeInstantiated.lifecycle.id;

  // Singleton: fast path in privateInjectFor already checked cache and missed.
  // Skip redundant getInstanceKey + cache check — go straight to instantiation.
  if (lifecycleId === 'singleton') {
    if (instantiationParameters.length > 0) {
      throw new Error(
        `Tried to inject singleton "${getNamespacedId(
          injectableToBeInstantiated,
        )}" from "${getNamespacedId(
          injectingInjectable,
        )}", but illegally to singletons, instantiationParameters were provided: "${instantiationParameters}".`,
      );
    }

    const minimalDi = createMinimalDi(
      di,
      injectableToBeInstantiated,
      injectingInjectable,
      namespacedIdByInjectableMap,
    );

    const newInstance = instantiate(
      di,
      injectableToBeInstantiated,
      minimalDi,
      instantiationParameters,
    );

    instanceMap.set(singletonCompositeKey, newInstance);

    return newInstance;
  }

  // Transient: never cached — skip key resolution, cache check, and cache store.
  if (lifecycleId === 'transient') {
    const minimalDi = createMinimalDi(
      di,
      injectableToBeInstantiated,
      injectingInjectable,
      namespacedIdByInjectableMap,
    );

    return instantiate(
      di,
      injectableToBeInstantiated,
      minimalDi,
      instantiationParameters,
    );
  }

  // keyedSingleton / custom lifecycle: full key resolution + cache check.
  const minimalDi = createMinimalDi(
    di,
    injectableToBeInstantiated,
    injectingInjectable,
    namespacedIdByInjectableMap,
  );

  const instanceKey = injectableToBeInstantiated.lifecycle.getInstanceKey(
    minimalDi,
    ...instantiationParameters,
  );

  const instanceCompositeKey = isCompositeKey(instanceKey)
    ? instanceKey.keys
    : [instanceKey];

  const existingInstance = instanceMap.get(instanceCompositeKey);

  if (existingInstance) {
    return existingInstance;
  }

  const newInstance = instantiate(
    di,
    injectableToBeInstantiated,
    minimalDi,
    instantiationParameters,
  );

  if (instanceCompositeKey[0] !== nonStoredInstanceKey) {
    instanceMap.set(instanceCompositeKey, newInstance);
  }

  return newInstance;
};
