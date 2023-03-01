import { isPromise } from '@ogre-tools/fp';

export const privateInjectManyFor =
  ({
    containerRootContextItem,
    getRelatedInjectables,
    getInject,
    setDependee,
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

      if (!isPromise(instance)) {
        return {
          instance,
          meta: { id: injectable.id },
        };
      }

      return instance.then(awaitedInstance => ({
        instance: awaitedInstance,
        meta: { id: injectable.id },
      }));
    });

    if (injected.find(isPromise)) {
      return Promise.all(injected);
    }

    return injected;
  };
