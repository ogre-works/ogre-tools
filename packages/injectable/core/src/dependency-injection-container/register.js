import { getNamespacedIdFor } from './getNamespacedIdFor';
import { registrationCallbackToken } from './tokens';
import toFlatInjectables from './toFlatInjectables';
import { DeepMap } from '@ogre-tools/fp';

export const registerFor =
  ({ registerSingle, injectMany }) =>
  ({ injectables, context, source }) => {
    toFlatInjectables(injectables).forEach(injectable => {
      registerSingle(injectable, context);
    });

    const callbacks = injectMany(registrationCallbackToken, context, source)();

    injectables.forEach(injectable => {
      callbacks.forEach(callback => {
        callback(injectable);
      });
    });
  };

export const registerSingleFor =
  ({
    injectableSet,
    injectableIdSet,
    instancesByInjectableMap,
    namespacedIdByInjectableMap,
    injectablesByInjectionToken,
    injectableAndRegistrationContext,
  }) =>
  (injectable, injectionContext) => {
    const injectableId = injectable.id;

    if (!injectableId) {
      throw new Error('Tried to register injectable without ID.');
    }

    injectableAndRegistrationContext.set(injectable, injectionContext);

    const getNamespacedId = getNamespacedIdFor(
      injectableAndRegistrationContext,
    );

    const namespacedId = getNamespacedId(injectable);

    if (namespacedIdByInjectableMap.has(injectable)) {
      throw new Error(
        `Tried to register same injectable multiple times: "${injectable.id}"`,
      );
    }

    if (injectableIdSet.has(namespacedId)) {
      throw new Error(
        `Tried to register multiple injectables for ID "${namespacedId}"`,
      );
    }

    injectableIdSet.add(namespacedId);
    injectableSet.add(injectable);
    namespacedIdByInjectableMap.set(injectable, namespacedId);
    instancesByInjectableMap.set(injectable, new DeepMap());

    if (injectable.injectionToken) {
      const token = injectable.injectionToken;

      const injectablesSet =
        injectablesByInjectionToken.get(token) || new Set();

      injectablesSet.add(injectable);

      injectablesByInjectionToken.set(token, injectablesSet);
    }
  };
