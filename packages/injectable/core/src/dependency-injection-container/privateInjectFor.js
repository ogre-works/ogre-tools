import { nonStoredInstanceKey, storedInstanceKey } from './lifecycleEnum';
import { withInstantiationDecoratorsFor } from './withInstantiationDecoratorsFor';
import { checkForTooManyMatches } from './checkForTooManyMatches';
import { isCompositeKey } from '../getCompositeKey/getCompositeKey';

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
    if (instantiationParameter === undefined) {
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
  const minimalInject = (alias, parameter) =>
    di.inject(alias, parameter, injectableToBeInstantiated);

  return {
    inject: minimalInject,

    injectWithMeta: (alias, parameter) =>
      di.injectWithMeta(alias, parameter, injectableToBeInstantiated),

    injectMany: (alias, parameter) =>
      di.injectMany(alias, parameter, injectableToBeInstantiated),

    injectManyWithMeta: (alias, parameter) =>
      di.injectManyWithMeta(alias, parameter, injectableToBeInstantiated),

    injectFactory: alias => instantiationParameter =>
      minimalInject(alias, instantiationParameter),

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

  if (canSkipDecorators) {
    return instantiationParameter === undefined
      ? injectableToBeInstantiated.instantiate(minimalDi)
      : injectableToBeInstantiated.instantiate(minimalDi, instantiationParameter);
  }

  const withInstantiationDecorators = withInstantiationDecoratorsFor({
    injectMany: di.injectMany,
    injectable: injectableToBeInstantiated,
    decoratorCache,
  });

  const instantiateWithDecorators = withInstantiationDecorators(
    injectableToBeInstantiated.instantiate,
  );

  return instantiationParameter === undefined
    ? instantiateWithDecorators(minimalDi)
    : instantiateWithDecorators(minimalDi, instantiationParameter);
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
    if (instantiationParameter) {
      throw new Error(
        `Tried to inject a singleton, but illegally to singletons, an instantiationParameter was provided: "${instantiationParameter}".`,
      );
    }

    const minimalDi = createMinimalDi(
      di, injectableToBeInstantiated, injectingInjectable, namespacedIdByInjectableMap,
    );

    const newInstance = instantiate(
      di, injectableToBeInstantiated, minimalDi, instantiationParameter, decoratorCache,
    );

    instanceMap.set(singletonCompositeKey, newInstance);

    return newInstance;
  }

  // Transient: never cached — skip key resolution, cache check, and cache store.
  if (lifecycleId === 'transient') {
    const minimalDi = createMinimalDi(
      di, injectableToBeInstantiated, injectingInjectable, namespacedIdByInjectableMap,
    );

    return instantiate(
      di, injectableToBeInstantiated, minimalDi, instantiationParameter, decoratorCache,
    );
  }

  // keyedSingleton / custom lifecycle: full key resolution + cache check.
  const minimalDi = createMinimalDi(
    di, injectableToBeInstantiated, injectingInjectable, namespacedIdByInjectableMap,
  );

  const instanceKey = injectableToBeInstantiated.lifecycle.getInstanceKey(
    minimalDi,
    instantiationParameter,
  );

  const instanceCompositeKey = isCompositeKey(instanceKey)
    ? instanceKey.keys
    : [instanceKey];

  const existingInstance = instanceMap.get(instanceCompositeKey);

  if (existingInstance) {
    return existingInstance;
  }

  const newInstance = instantiate(
    di, injectableToBeInstantiated, minimalDi, instantiationParameter, decoratorCache,
  );

  if (instanceCompositeKey[0] !== nonStoredInstanceKey) {
    instanceMap.set(instanceCompositeKey, newInstance);
  }

  return newInstance;
};
