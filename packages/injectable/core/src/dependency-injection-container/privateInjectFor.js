import { nonStoredInstanceKey } from './lifecycleEnum';
import { withInstantiationDecoratorsFor } from './withInstantiationDecoratorsFor';
import { checkForTooManyMatches } from './checkForTooManyMatches';
import { isCompositeKey } from '../getCompositeKey/getCompositeKey';

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
  }) =>
  ({ withMeta }) =>
  (alias, context = [], source) =>
  (...parameters) => {
    const di = getDi();

    const relatedInjectables = getRelatedInjectables(alias);

    checkForTooManyMatches(relatedInjectables, alias);
    checkForNoMatches(relatedInjectables, alias, context);

    const originalInjectable = getRelatedInjectables(alias)[0];

    alreadyInjected.add(originalInjectable);

    const overriddenInjectable = overridingInjectables.get(originalInjectable);

    const injectable = overriddenInjectable || originalInjectable;

    checkForSideEffects(injectable, context);

    const instance = getInstance({
      di,
      injectable,
      context,
      instancesByInjectableMap,
      source,
      getNamespacedId,
    })(...parameters);

    if (!withMeta) {
      return instance;
    }

    const namespacedId = getNamespacedId(injectable);

    return {
      instance,
      meta: { id: namespacedId },
    };
  };

const getInstance =
  ({
    di,
    injectable: injectableToBeInstantiated,
    context: oldContext,
    instancesByInjectableMap,
    source,
    getNamespacedId,
  }) =>
  (...parameters) => {
    const newContext = [
      ...oldContext,

      {
        injectable: injectableToBeInstantiated,
        instantiationParameters: parameters,
      },
    ];

    const instanceMap = instancesByInjectableMap.get(
      injectableToBeInstantiated.overriddenInjectable ||
        injectableToBeInstantiated,
    );

    const minimalInject =
      alias =>
      (...parameters) =>
        di.inject(alias, newContext, injectableToBeInstantiated)(...parameters);

    const minimalDi = {
      inject: minimalInject,

      injectWithMeta:
        alias =>
        (...parameters) =>
          di.injectWithMeta(
            alias,
            newContext,
            injectableToBeInstantiated,
          )(...parameters),

      injectMany:
        alias =>
        (...parameters) =>
          di.injectMany(
            alias,
            newContext,
            injectableToBeInstantiated,
          )(...parameters),

      injectManyWithMeta:
        alias =>
        (...parameters) =>
          di.injectManyWithMeta(
            alias,
            newContext,
            injectableToBeInstantiated,
          )(...parameters),

      injectFactory:
        alias =>
        (...parameters) =>
          minimalInject(alias)(...parameters),

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
    };

    const instanceKey = injectableToBeInstantiated.lifecycle.getInstanceKey(
      minimalDi,
    )(...parameters);

    const instanceCompositeKey = isCompositeKey(instanceKey)
      ? instanceKey.keys
      : [instanceKey];

    const existingInstance = instanceMap.get(instanceCompositeKey);

    if (existingInstance) {
      return existingInstance;
    }

    const withInstantiationDecorators = withInstantiationDecoratorsFor({
      injectMany: di.injectMany,
      injectable: injectableToBeInstantiated,
    });

    const instantiateWithDecorators = withInstantiationDecorators(
      injectableToBeInstantiated.instantiate,
    );

    const newInstance = instantiateWithDecorators(minimalDi)(...parameters);

    if (instanceCompositeKey[0] !== nonStoredInstanceKey) {
      instanceMap.set(instanceCompositeKey, newInstance);
    }

    return newInstance;
  };
