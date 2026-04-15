import { getNamespacedIdFor } from './getNamespacedIdFor';
import {
  registrationCallbackToken,
  registrationDecoratorToken,
  deregistrationDecoratorToken,
} from './tokens';
import toFlatInjectables from './toFlatInjectables';
import { CompositeMap } from '../composite-map/composite-map';
import { getRelatedTokens } from './getRelatedTokens';

const isDecoratorInjectable = injectable =>
  injectable.injectionToken === registrationDecoratorToken ||
  injectable.injectionToken === deregistrationDecoratorToken;

export const registerFor =
  ({ registerSingle, injectMany, withRegistrationDecorators }) =>
  ({ injectables, context, source }) => {
    const flatInjectables = toFlatInjectables(injectables);

    // Pass 1: register reg/dereg decorator injectables first (undecorated)
    const decoratorInjectables = flatInjectables.filter(isDecoratorInjectable);

    decoratorInjectables.forEach(injectable => {
      registerSingle(injectable, context);
    });

    // Pass 2: register everything else through the decoration chain
    const nonDecoratorInjectables = flatInjectables.filter(
      injectable => !isDecoratorInjectable(injectable),
    );

    const registeredInjectables = [];
    let batchInProgress = true;

    nonDecoratorInjectables.forEach(injectable => {
      let wasRegistered = false;

      const boundRegisterSingle = inj => {
        registerSingle(inj, context);
        wasRegistered = true;

        // When called deferred (after batch completes), trigger callbacks
        if (!batchInProgress) {
          const callbacks = injectMany(
            registrationCallbackToken,
            undefined,
            context,
            source,
          );

          callbacks.forEach(callback => {
            callback(inj);
          });
        }
      };

      const decoratedRegister = withRegistrationDecorators(
        boundRegisterSingle,
        injectable,
        context,
        source,
      );

      decoratedRegister(injectable);

      if (wasRegistered) {
        registeredInjectables.push(injectable);
      }
    });

    batchInProgress = false;

    // Fire callbacks for all actually registered injectables (batch semantics)
    const allRegistered = [...decoratorInjectables, ...registeredInjectables];

    const callbacks = injectMany(
      registrationCallbackToken,
      undefined,
      context,
      source,
    );

    allRegistered.forEach(injectable => {
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
    instancesByInjectableMap.set(injectable, new CompositeMap());

    const tokens = getRelatedTokens(injectable.injectionToken);

    tokens.forEach(token => {
      const injectablesSet =
        injectablesByInjectionToken.get(token) || new Set();

      injectablesSet.add(injectable);

      injectablesByInjectionToken.set(token, injectablesSet);
    });
  };
