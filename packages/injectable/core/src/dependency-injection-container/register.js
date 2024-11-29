import { getNamespacedIdFor } from './getNamespacedIdFor';
import {
  preregistrationCallbackToken,
  registrationCallbackToken,
} from './tokens';
import toFlatInjectables from './toFlatInjectables';
import { DeepMap } from '@ogre-tools/fp';
import { getRelatedTokens } from './getRelatedTokens';

export const registerFor =
  ({ registerSingle, injectMany }) =>
  ({ injectables, context, source }) => {
    const preregistrationCallback = injectMany(
      preregistrationCallbackToken,
      undefined,
      context,
      source,
    );

    injectables.forEach(injectable => {
      preregistrationCallback.forEach(callback => {
        callback(injectable);
      });
    });

    toFlatInjectables(injectables).forEach(injectable => {
      registerSingle(injectable, context);
    });

    const registrationCallback = injectMany(
      registrationCallbackToken,
      undefined,
      context,
      source,
    );

    injectables.forEach(injectable => {
      registrationCallback.forEach(callback => {
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

    const tokens = getRelatedTokens(injectable.injectionToken);

    tokens.forEach(token => {
      const injectablesSet =
        injectablesByInjectionToken.get(token) || new Set();

      injectablesSet.add(injectable);

      injectablesByInjectionToken.set(token, injectablesSet);
    });
  };
