import { registrationCallbackToken } from './createContainer';

export const registerFor =
  ({ registerSingle, injectMany }) =>
  (...injectables) => {
    injectables.forEach(injectable => {
      registerSingle(injectable);
    });

    const callbacks = injectMany(registrationCallbackToken);

    injectables.forEach(injectable => {
      callbacks.forEach(callback => {
        callback(injectable);
      });
    });
  };

export const registerSingleFor =
  ({
    injectableMap,
    instancesByInjectableMap,
    injectableIdsByInjectionToken,
  }) =>
  externalInjectable => {
    let injectableId = externalInjectable.id;

    if (!injectableId) {
      throw new Error('Tried to register injectable without ID.');
    }

    if (injectableMap.has(injectableId)) {
      throw new Error(
        `Tried to register multiple injectables for ID "${injectableId}"`,
      );
    }

    const internalInjectable = {
      ...externalInjectable,

      permitSideEffects: function () {
        this.causesSideEffects = false;
      },
    };

    injectableMap.set(internalInjectable.id, internalInjectable);
    instancesByInjectableMap.set(internalInjectable.id, new Map());

    if (externalInjectable.injectionToken) {
      const tokenId = externalInjectable.injectionToken.id;

      const injectableIdsSet =
        injectableIdsByInjectionToken.get(tokenId) || new Set();

      injectableIdsSet.add(injectableId);

      injectableIdsByInjectionToken.set(tokenId, injectableIdsSet);
    }
  };
