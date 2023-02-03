import { isPromise } from '@ogre-tools/fp';

export const nonDecoratedPrivateInjectManyFor =
  ({ containerRootContextItem, getRelatedInjectables, getInject }) =>
  ({ withMeta }) =>
  (
    injectionToken,
    instantiationParameter,
    oldContext = [containerRootContextItem],
  ) => {
    const inject = getInject();

    const newContext = [...oldContext, { injectable: injectionToken }];

    const relatedInjectables = getRelatedInjectables(injectionToken);

    const injected = relatedInjectables.map(injectable => {
      const instance = inject(injectable, instantiationParameter, newContext);

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
