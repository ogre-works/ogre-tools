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

  const minimalInject = (alias, parameter) =>
    di.inject(alias, parameter, injectableToBeInstantiated);

  const minimalDi = {
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
