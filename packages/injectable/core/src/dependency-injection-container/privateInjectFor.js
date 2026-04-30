import { nonStoredInstanceKey, storedInstanceKey } from './lifecycleEnum';
import { isCompositeKey } from '../getCompositeKey/getCompositeKey';
import { injectableSymbol2 } from '../getInjectable2/getInjectable2';
import { instantiationDecoratorToken } from './tokens';
import { CompositeMap } from '../composite-map/composite-map';
import { LruCompositeMap } from '../composite-map/lru-composite-map';
import flow from './fastFlow';

// Pre-allocated key for singleton instance lookup — avoids array creation per inject()
const singletonCompositeKey = [storedInstanceKey];

// Detects the keyedSingleton storage shape. Singletons (and v2-default
// injectables that have only ever been called without args) store the
// instance directly; keyedSingleton with-args storage uses a CompositeMap.
export const isCompositeStorage = stored =>
  stored instanceof CompositeMap || stored instanceof LruCompositeMap;

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
    getApplicableDecorators,
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

    const injectable =
      overridingInjectables.size > 0
        ? overridingInjectables.get(originalInjectable) || originalInjectable
        : originalInjectable;

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
    // The stored value is one of:
    //   - undefined: nothing cached yet
    //   - CompositeMap / LruCompositeMap: keyedSingleton cache, look up by
    //     singletonCompositeKey for a no-args call
    //   - any other value: instance directly (singleton lifecycle, or v2
    //     default lifecycle that has only ever been called with no args)
    //
    // We dispatch on lifecycle.id first so plain singletons (the dominant
    // case) skip the instanceof checks entirely; only keyedSingleton-shaped
    // lifecycles fall through to the structural check.
    if (instantiationParameters.length === 0) {
      const stored = instancesByInjectableMap.get(
        injectable.overriddenInjectable || injectable,
      );

      let existingInstance;

      if (injectable.lifecycle.id === 'singleton') {
        existingInstance = stored;
      } else if (isCompositeStorage(stored)) {
        existingInstance = stored.get(singletonCompositeKey);
      } else {
        existingInstance = stored;
      }

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
      getApplicableDecorators,
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
  // Closure-captured methods are fixed up-front (`shared` plus inject*),
  // so user code can detach them — `const { register } = di; register(...)`
  // and similar patterns appear in tests. A class-with-prototype dispatcher
  // would be cheaper to allocate but loses that detach-friendly behavior.
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

  if (injectableToBeInstantiated.aliasType === injectableSymbol2) {
    // V2 minimalDi: inject/injectMany/etc are factory-returning. Each method
    // is inlined directly against `di` (no minimalInject* intermediary) so
    // we don't allocate four extra closures per minimalDi just to forward.
    return {
      ...shared,

      inject:
        alias =>
        (...params) =>
          di.inject({
            alias,
            instantiationParameters: params,
            injectingInjectable: injectableToBeInstantiated,
          }),

      injectMany:
        alias =>
        (...params) =>
          di.injectMany({
            alias,
            instantiationParameters: params,
            injectingInjectable: injectableToBeInstantiated,
          }),

      injectWithMeta:
        alias =>
        (...params) =>
          di.injectWithMeta({
            alias,
            instantiationParameters: params,
            injectingInjectable: injectableToBeInstantiated,
          }),

      injectManyWithMeta:
        alias =>
        (...params) =>
          di.injectManyWithMeta({
            alias,
            instantiationParameters: params,
            injectingInjectable: injectableToBeInstantiated,
          }),
    };
  }

  // V1 minimalDi: inject/injectMany/etc return instances directly.
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
  getApplicableDecorators,
) => {
  // Decorators always look up against the original injectable so that an
  // imperative override (di.override / di.earlyOverride) is wrapped by any
  // decorators registered against the original target — composing decorators
  // rely on this.
  const target =
    injectableToBeInstantiated.overriddenInjectable || injectableToBeInstantiated;

  const decorators = getApplicableDecorators({
    decoratorToken: instantiationDecoratorToken,
    target,
    injectingInjectable: injectableToBeInstantiated,
  });

  const decorated =
    decorators.length === 0
      ? injectableToBeInstantiated.instantiate
      : flow(...decorators)(injectableToBeInstantiated.instantiate);

  // New-style injectable2: curried (di) => (...params) => instance
  if (injectableToBeInstantiated.aliasType === injectableSymbol2) {
    return decorated(minimalDi)(...instantiationParameters);
  }

  // Old-style: (di, ...params) => instance
  return decorated(minimalDi, ...instantiationParameters);
};

const ensureInstanceMap = (instancesByInjectableMap, key) => {
  let instanceMap = instancesByInjectableMap.get(key);

  if (!instanceMap) {
    instanceMap = new CompositeMap();
    instancesByInjectableMap.set(key, instanceMap);
  }

  return instanceMap;
};

const getInstance = (
  di,
  injectableToBeInstantiated,
  instantiationParameters,
  instancesByInjectableMap,
  injectingInjectable,
  namespacedIdByInjectableMap,
  getNamespacedId,
  getApplicableDecorators,
) => {
  const cacheKey =
    injectableToBeInstantiated.overriddenInjectable ||
    injectableToBeInstantiated;

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
      getApplicableDecorators,
    );

    // Singletons store the instance directly in the map — no per-injectable
    // CompositeMap wrapper. Saves ~5 object allocations per first-inject.
    instancesByInjectableMap.set(cacheKey, newInstance);

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
      getApplicableDecorators,
    );
  }

  // V2-default + no-args fast path: behaves like a singleton. Skip
  // getInstanceKey + key-array allocation + CompositeMap allocation. The
  // instance is stored directly under cacheKey, matching the singleton
  // shape. If the same v2 injectable is later called with args (rare mixed
  // usage), the keyedSingleton path below migrates the existing instance
  // into a CompositeMap under singletonCompositeKey before adding the new
  // keyed entry.
  if (
    instantiationParameters.length === 0 &&
    injectableToBeInstantiated.lifecycle._isV2DefaultLifecycle
  ) {
    const existing = instancesByInjectableMap.get(cacheKey);

    if (!isCompositeStorage(existing)) {
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
        getApplicableDecorators,
      );

      instancesByInjectableMap.set(cacheKey, newInstance);
      return newInstance;
    }
    // existing is a CompositeMap (mixed usage path) — fall through.
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

  let existingMap = instancesByInjectableMap.get(cacheKey);

  // Mixed-usage migration: only v2-default injectables can have arrived
  // here with an instance in the slot (from a prior no-args call). For
  // every other keyedSingleton, the slot is either undefined or a
  // CompositeMap, so skip the structural check.
  if (
    injectableToBeInstantiated.lifecycle._isV2DefaultLifecycle &&
    existingMap !== undefined &&
    !isCompositeStorage(existingMap)
  ) {
    const previousInstance = existingMap;
    existingMap = new CompositeMap();
    existingMap.set(singletonCompositeKey, previousInstance);
    instancesByInjectableMap.set(cacheKey, existingMap);
  }

  const existingInstance = existingMap?.get(instanceCompositeKey);

  if (existingInstance) {
    return existingInstance;
  }

  const newInstance = instantiate(
    di,
    injectableToBeInstantiated,
    minimalDi,
    instantiationParameters,
    getApplicableDecorators,
  );

  if (instanceCompositeKey[0] !== nonStoredInstanceKey) {
    ensureInstanceMap(instancesByInjectableMap, cacheKey).set(
      instanceCompositeKey,
      newInstance,
    );
  }

  return newInstance;
};
