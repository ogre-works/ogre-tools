import { isPromise } from '@ogre-tools/fp';

export const privateInjectManyFor =
  ({
    containerRootContextItem,
    getRelatedInjectables,
    getInject,
    setDependee,
    getNamespacedId,
  }) =>
  ({ withMeta }) =>
  (
    injectionToken,
    instantiationParameter,
    oldContext = [containerRootContextItem],
    source,
  ) => {
    setDependee({ dependency: injectionToken, dependee: source });

    const inject = getInject();

    const newContext = [...oldContext, { injectable: injectionToken }];

    const relatedInjectables = getRelatedInjectables(injectionToken);

    const injected = relatedInjectables.map(injectable => {
      const instance = inject(
        injectable,
        instantiationParameter,
        newContext,
        injectionToken,
      );

      if (!withMeta) {
        return instance;
      }

      const namespacedId = getNamespacedId(injectable);

      if (!isPromise(instance)) {
        return {
          instance,
          meta: { id: namespacedId },
        };
      }

      return instance.then(awaitedInstance => ({
        instance: awaitedInstance,
        meta: { id: namespacedId },
      }));
    });

    if (injected.find(isPromise)) {
      return Promise.all(injected);
    }

    return injected;
  };
