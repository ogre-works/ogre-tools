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
  ({ injectableSet, instancesByInjectableMap, injectablesByInjectionToken }) =>
  injectable => {
    let injectableId = injectable.id;

    if (!injectableId) {
      throw new Error('Tried to register injectable without ID.');
    }

    if ([...injectableSet.values()].find(x => x.id === injectableId)) {
      throw new Error(
        `Tried to register multiple injectables for ID "${injectableId}"`,
      );
    }

    injectableSet.add(injectable);
    instancesByInjectableMap.set(injectable, new Map());

    if (injectable.injectionToken) {
      const token = injectable.injectionToken;

      const injectablesSet =
        injectablesByInjectionToken.get(token) || new Set();

      injectablesSet.add(injectable);

      injectablesByInjectionToken.set(token, injectablesSet);
    }
  };
