import { nonStoredInstanceKey, storedInstanceKey } from './lifecycleEnum';
import { withInstantiationDecoratorsFor } from './withInstantiationDecoratorsFor';
import { checkForTooManyMatches } from './checkForTooManyMatches';
import { isCompositeKey } from '../getCompositeKey/getCompositeKey';

// Pre-allocated key for singleton instance lookup — avoids array creation per inject()
const singletonCompositeKey = [storedInstanceKey];

// Flatten the linked list into an array for registration context.
// Only called when register/deregister is used inside instantiate (rare).
const flattenSourceChain = node => {
  const result = [];
  let current = node;

  while (current) {
    result.push({ injectable: current.injectable });
    current = current.parent;
  }

  return result.reverse();
};

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
  (alias, instantiationParameter, source, sourceChainNode) => {
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
          meta: { id: getNamespacedId(injectable) },
        };
      }
    }

    const instance = getInstance(
      di,
      injectable,
      instantiationParameter,
      instancesByInjectableMap,
      source,
      getNamespacedId,
      decoratorCache,
      sourceChainNode,
    );

    if (!withMeta) {
      return instance;
    }

    return {
      instance,
      meta: { id: getNamespacedId(injectable) },
    };
  };

const getInstance = (
  di,
  injectableToBeInstantiated,
  instantiationParameter,
  instancesByInjectableMap,
  source,
  getNamespacedId,
  decoratorCache,
  parentSourceChainNode,
) => {
  const instanceMap = instancesByInjectableMap.get(
    injectableToBeInstantiated.overriddenInjectable ||
      injectableToBeInstantiated,
  );

  // Linked list node — O(1) per injection instead of O(depth) array spread
  const sourceChainNode = {
    injectable: injectableToBeInstantiated,
    parent: parentSourceChainNode,
  };

  const minimalInject = (alias, parameter) =>
    di.inject(alias, parameter, injectableToBeInstantiated, sourceChainNode);

  const minimalDi = {
    inject: minimalInject,

    injectWithMeta: (alias, parameter) =>
      di.injectWithMeta(
        alias,
        parameter,
        injectableToBeInstantiated,
        sourceChainNode,
      ),

    injectMany: (alias, parameter) =>
      di.injectMany(
        alias,
        parameter,
        injectableToBeInstantiated,
        sourceChainNode,
      ),

    injectManyWithMeta: (alias, parameter) =>
      di.injectManyWithMeta(
        alias,
        parameter,
        injectableToBeInstantiated,
        sourceChainNode,
      ),

    injectFactory: alias => instantiationParameter =>
      minimalInject(alias, instantiationParameter),

    register: (...injectables) => {
      di.register({
        injectables,
        context: flattenSourceChain(sourceChainNode),
        source: injectableToBeInstantiated,
      });
    },

    deregister: (...injectables) => {
      di.deregister({
        injectables,
        context: flattenSourceChain(sourceChainNode),
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
