import { isPromise } from '@ogre-tools/fp';

export const nonDecoratedPrivateInjectManyFor =
  ({ containerRootContextItem, getRelatedInjectables, getInject }) =>
  (
    injectionToken,
    instantiationParameter,
    oldContext = [containerRootContextItem],
  ) => {
    const inject = getInject();

    const newContext = [...oldContext, { injectable: injectionToken }];

    const relatedInjectables = getRelatedInjectables(injectionToken);

    const injected = relatedInjectables.map(injectable =>
      inject(injectable, instantiationParameter, newContext),
    );

    if (injected.find(isPromise)) {
      return Promise.all(injected);
    }

    return injected;
  };
