import { getNamespacedIdFor } from './getNamespacedIdFor';
import {
  registrationCallbackToken,
  registrationDecoratorToken,
  deregistrationDecoratorToken,
} from './tokens';
import toFlatInjectables from './toFlatInjectables';
import { CompositeMap } from '../composite-map/composite-map';
import { LruCompositeMap } from '../composite-map/lru-composite-map';
import { getRelatedTokens } from './getRelatedTokens';
import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import flow from './fastFlow';
import { invalidateRelatedInjectablesCache } from './getRelatedInjectablesFor';

const isDecoratorInjectable = injectable =>
  injectable.injectionToken === registrationDecoratorToken ||
  injectable.injectionToken === deregistrationDecoratorToken;

export const registerFor =
  ({ registerSingle, injectMany }) =>
  ({ injectables, context, source }) => {
    const flatInjectables = toFlatInjectables(injectables);

    // Single-pass partition into decorators and non-decorators.
    const decoratorInjectables = [];
    const nonDecoratorInjectables = [];

    for (let i = 0; i < flatInjectables.length; i++) {
      const injectable = flatInjectables[i];

      if (isDecoratorInjectable(injectable)) {
        decoratorInjectables.push(injectable);
      } else {
        nonDecoratorInjectables.push(injectable);
      }
    }

    // Pass 1: register reg/dereg decorator injectables first (undecorated)
    decoratorInjectables.forEach(injectable => {
      registerSingle(injectable, context);
    });

    // Collect all registration decorators once (not per-injectable)
    const allRegistrationDecorators = injectMany(
      registrationDecoratorToken,
      [],
      source,
    );

    const registeredInjectables = [];
    let batchInProgress = true;

    nonDecoratorInjectables.forEach(injectable => {
      // Fast path: no decorators or injectable is not decorable
      if (
        allRegistrationDecorators.length === 0 ||
        injectable.decorable === false
      ) {
        registerSingle(injectable, context);
        registeredInjectables.push(injectable);
        return;
      }

      // Slow path: apply relevant decorators
      const relevantDecorators = allRegistrationDecorators
        .filter(isRelevantDecoratorFor(injectable))
        .map(x => x.decorate);

      if (relevantDecorators.length === 0) {
        registerSingle(injectable, context);
        registeredInjectables.push(injectable);
        return;
      }

      let wasRegistered = false;

      const boundRegisterSingle = inj => {
        registerSingle(inj, context);
        wasRegistered = true;

        // When called deferred (after batch completes), trigger callbacks
        if (!batchInProgress) {
          const callbacks = injectMany(registrationCallbackToken, [], context);

          callbacks.forEach(callback => {
            callback(inj);
          });
        }
      };

      const decoratedRegister = flow(...relevantDecorators)(
        boundRegisterSingle,
      );

      decoratedRegister(injectable);

      if (wasRegistered) {
        registeredInjectables.push(injectable);
      }
    });

    batchInProgress = false;

    // Fire callbacks for all actually registered injectables (batch semantics)
    const callbacks = injectMany(registrationCallbackToken, [], source);

    const fireCallbacks = injectable => {
      callbacks.forEach(callback => {
        callback(injectable);
      });
    };

    decoratorInjectables.forEach(fireCallbacks);
    registeredInjectables.forEach(fireCallbacks);
  };

export const registerSingleFor = ({
  injectableSet,
  injectableIdSet,
  instancesByInjectableMap,
  namespacedIdByInjectableMap,
  injectablesByInjectionToken,
  injectableAndRegistrationContext,
  childrenByParentMap,
  firePurgeCallbacks,
}) => {
  const getNamespacedId = getNamespacedIdFor(injectableAndRegistrationContext);

  return (injectable, injectionContext) => {
    const injectableId = injectable.id;

    if (!injectableId) {
      throw new Error('Tried to register injectable without ID.');
    }

    injectableAndRegistrationContext.set(injectable, injectionContext);

    // Build reverse index: for each parent in the context, record this injectable as a child.
    for (let i = 0; i < injectionContext.length; i++) {
      const parent = injectionContext[i].injectable;
      let children = childrenByParentMap.get(parent);

      if (!children) {
        children = new Set();
        childrenByParentMap.set(parent, children);
      }

      children.add(injectable);
    }

    const namespacedId = getNamespacedId(injectable);

    if (namespacedIdByInjectableMap.has(injectable)) {
      throw new Error(
        `Tried to register same injectable multiple times: "${namespacedIdByInjectableMap.get(
          injectable,
        )}"`,
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
    const maxCacheSize =
      injectable.maxCacheSize ?? injectable.injectionToken?.maxCacheSize;

    const instanceMap =
      maxCacheSize > 0
        ? new LruCompositeMap(maxCacheSize, {
            onEvict: (instance, keyArray) =>
              firePurgeCallbacks(injectable, instance, keyArray),
          })
        : new CompositeMap();

    instancesByInjectableMap.set(injectable, instanceMap);

    const tokens = getRelatedTokens(injectable.injectionToken);

    for (let t = 0; t < tokens.length; t++) {
      const token = tokens[t];
      let injectablesSet = injectablesByInjectionToken.get(token);

      if (!injectablesSet) {
        injectablesSet = new Set();
        injectablesByInjectionToken.set(token, injectablesSet);
      }

      injectablesSet.add(injectable);
      invalidateRelatedInjectablesCache(injectablesSet);
    }
  };
};
