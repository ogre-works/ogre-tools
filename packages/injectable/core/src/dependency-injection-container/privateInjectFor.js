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
    getNamespacedId,
    decoratorCache,
  }) =>
  ({ withMeta }) =>
  (alias, instantiationParameter, context = [], source) => {
    const di = getDi();

    const relatedInjectables = getRelatedInjectables(alias);

    checkForTooManyMatches(relatedInjectables, alias);
    checkForNoMatches(relatedInjectables, alias, context);

    const originalInjectable = relatedInjectables[0];

    alreadyInjected.add(originalInjectable);

    const overriddenInjectable = overridingInjectables.get(originalInjectable);

    const injectable = overriddenInjectable || originalInjectable;

    checkForSideEffects(injectable, context);

    // Fast path: singleton cache hit — avoid creating minimalDi entirely.
    // For singletons without instantiationParameter, the instance key is always
    // storedInstanceKey. Check the cache directly before the expensive getInstance.
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
          meta: { id: getNamespacedId(injectable) },
        };
      }
    }

    const instance = getInstance(
      di,
      injectable,
      instantiationParameter,
      context,
      instancesByInjectableMap,
      source,
      getNamespacedId,
      decoratorCache,
    );

    if (!withMeta) {
      return instance;
    }

    const namespacedId = getNamespacedId(injectable);

    return {
      instance,
      meta: { id: namespacedId },
    };
  };

const getInstance = (
  di,
  injectableToBeInstantiated,
  instantiationParameter,
  oldContext,
  instancesByInjectableMap,
  source,
  getNamespacedId,
  decoratorCache,
) => {
  const newContext = [
    ...oldContext,

    {
      injectable: injectableToBeInstantiated,
      instantiationParameter,
    },
  ];

  const instanceMap = instancesByInjectableMap.get(
    injectableToBeInstantiated.overriddenInjectable ||
      injectableToBeInstantiated,
  );

  const minimalInject = (alias, parameter) =>
    di.inject(alias, parameter, newContext, injectableToBeInstantiated);

  const minimalDi = {
    inject: minimalInject,

    injectWithMeta: (alias, parameter) =>
      di.injectWithMeta(
        alias,
        parameter,
        newContext,
        injectableToBeInstantiated,
      ),

    injectMany: (alias, parameter) =>
      di.injectMany(alias, parameter, newContext, injectableToBeInstantiated),

    injectManyWithMeta: (alias, parameter) =>
      di.injectManyWithMeta(
        alias,
        parameter,
        newContext,
        injectableToBeInstantiated,
      ),

    injectFactory: alias => instantiationParameter =>
      minimalInject(alias, instantiationParameter),

    context: newContext,

    register: (...injectables) => {
      di.register({
        injectables,
        context: newContext,
        source: injectableToBeInstantiated,
      });
    },

    deregister: (...injectables) => {
      di.deregister({
        injectables,
        context: newContext,
        source: injectableToBeInstantiated,
      });
    },

    get sourceNamespace() {
      return (
        getNamespacedId(source).split(':').slice(0, -1).join(':') || undefined
      );
    },

    hasRegistrations: di.hasRegistrations,
  };

  const instanceKey = injectableToBeInstantiated.lifecycle.getInstanceKey(
    minimalDi,
    instantiationParameter,
  );

  const instanceCompositeKey = isCompositeKey(instanceKey)
    ? instanceKey.keys
    : instanceKey === storedInstanceKey
      ? singletonCompositeKey
      : [instanceKey];

  const existingInstance = instanceMap.get(instanceCompositeKey);

  if (existingInstance) {
    return existingInstance;
  }

  const withInstantiationDecorators = withInstantiationDecoratorsFor({
    injectMany: di.injectMany,
    injectable: injectableToBeInstantiated,
    decoratorCache,
  });

  const instantiateWithDecorators = withInstantiationDecorators(
    injectableToBeInstantiated.instantiate,
  );

  const newInstance = instantiateWithDecorators(
    minimalDi,
    ...(instantiationParameter === undefined ? [] : [instantiationParameter]),
  );

  if (instanceCompositeKey[0] !== nonStoredInstanceKey) {
    instanceMap.set(instanceCompositeKey, newInstance);
  }

  return newInstance;
};
