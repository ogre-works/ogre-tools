import { nonStoredInstanceKey, storedInstanceKey } from './lifecycleEnum';
import { withInstantiationDecoratorsFor } from './withInstantiationDecoratorsFor';
import { checkForTooManyMatches } from './checkForTooManyMatches';
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
    checkForSideEffects,
    namespacedIdByInjectableMap,
    decoratorCache,
  }) =>
  ({ withMeta }) =>
  (alias, instantiationParameter, injectingInjectable) => {
    const di = getDi();

    const relatedInjectables = getRelatedInjectables(alias);

    checkForTooManyMatches(relatedInjectables, alias);
    checkForNoMatches(relatedInjectables, alias);

    const originalInjectable = relatedInjectables[0];

    alreadyInjected.add(originalInjectable);

    const overriddenInjectable = overridingInjectables.get(originalInjectable);

    const injectable = overriddenInjectable || originalInjectable;

    checkForSideEffects(injectable);

    // Fast path: singleton cache hit — avoid creating minimalDi entirely.
    if (instantiationParameter.length === 0) {
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
      instantiationParameter,
      instancesByInjectableMap,
      injectingInjectable,
      namespacedIdByInjectableMap,
      decoratorCache,
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
  };

  // New-style injectable2: inject/injectMany always return factories
  if (injectableToBeInstantiated.aliasType === injectableSymbol2) {
    return {
      ...shared,

      inject:
        alias =>
        (...args) =>
          di.inject(alias, args, injectableToBeInstantiated),

      injectMany:
        alias =>
        (...args) =>
          di.injectMany(alias, args, injectableToBeInstantiated),

      injectWithMeta:
        alias =>
        (...args) =>
          di.injectWithMeta(alias, args, injectableToBeInstantiated),

      injectManyWithMeta:
        alias =>
        (...args) =>
          di.injectManyWithMeta(alias, args, injectableToBeInstantiated),
    };
  }

  // Old-style: variadic inject that passes args array through
  const minimalInject = (alias, ...args) =>
    di.inject(alias, args, injectableToBeInstantiated);

  return {
    ...shared,

    inject: minimalInject,

    injectWithMeta: (alias, ...args) =>
      di.injectWithMeta(alias, args, injectableToBeInstantiated),

    injectMany: (alias, ...args) =>
      di.injectMany(alias, args, injectableToBeInstantiated),

    injectManyWithMeta: (alias, ...args) =>
      di.injectManyWithMeta(alias, args, injectableToBeInstantiated),

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
  instantiationParameter,
  decoratorCache,
) => {
  // Skip decorator machinery when no decorators are registered (common case).
  const canSkipDecorators =
    injectableToBeInstantiated.decorable === false ||
    (decoratorCache.instantiation !== null &&
      decoratorCache.instantiation.length === 0);

  // New-style injectable2: two-step curried instantiate
  if (injectableToBeInstantiated.aliasType === injectableSymbol2) {
    const factory = injectableToBeInstantiated.instantiate(minimalDi);
    return factory(...instantiationParameter);
  }

  // Old-style: spread args
  if (canSkipDecorators) {
    return injectableToBeInstantiated.instantiate(
      minimalDi,
      ...instantiationParameter,
    );
  }

  const withInstantiationDecorators = withInstantiationDecoratorsFor({
    injectMany: di.injectMany,
    injectable: injectableToBeInstantiated,
    decoratorCache,
  });

  const instantiateWithDecorators = withInstantiationDecorators(
    injectableToBeInstantiated.instantiate,
  );

  return instantiateWithDecorators(minimalDi, ...instantiationParameter);
};

const getInstance = (
  di,
  injectableToBeInstantiated,
  instantiationParameter,
  instancesByInjectableMap,
  injectingInjectable,
  namespacedIdByInjectableMap,
  decoratorCache,
) => {
  const instanceMap = instancesByInjectableMap.get(
    injectableToBeInstantiated.overriddenInjectable ||
      injectableToBeInstantiated,
  );

  const lifecycleId = injectableToBeInstantiated.lifecycle.id;

  // Singleton: fast path in privateInjectFor already checked cache and missed.
  // Skip redundant getInstanceKey + cache check — go straight to instantiation.
  if (lifecycleId === 'singleton') {
    if (instantiationParameter.length > 0) {
      throw new Error(
        `Tried to inject singleton "${injectableToBeInstantiated.id}", but illegally to singletons, instantiationParameters were provided: "${instantiationParameter}".`,
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
      instantiationParameter,
      decoratorCache,
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
      instantiationParameter,
      decoratorCache,
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
    ...instantiationParameter,
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
    instantiationParameter,
    decoratorCache,
  );

  if (instanceCompositeKey[0] !== nonStoredInstanceKey) {
    instanceMap.set(instanceCompositeKey, newInstance);
  }

  return newInstance;
};
