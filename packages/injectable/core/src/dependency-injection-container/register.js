import { getNamespacedIdFor } from './getNamespacedIdFor';
import {
  instantiationDecoratorToken,
  registrationCallbackToken,
  registrationDecoratorToken,
} from './tokens';
import toFlatInjectables from './toFlatInjectables';
import { CompositeMap } from '../composite-map/composite-map';
import { LruCompositeMap } from '../composite-map/lru-composite-map';
import { getRelatedTokens, isRelatedToToken } from './getRelatedTokens';
import { invalidateRelatedInjectablesCache } from './getRelatedInjectablesFor';
import flow from './fastFlow';

export const registerFor =
  ({ registerSingle, injectMany, getTagKeyedDecorators }) =>
  ({ injectables, context, source }) => {
    const flatInjectables = toFlatInjectables(injectables);

    // Phase 0: instantiation-decorator-tagged injectables. They register
    //   first so that any same-batch overrides of (registration-)decorators
    //   are already in place by the time those decorators are instantiated
    //   in phase 2. They go through the registration-decorator pipeline so
    //   production code can opt them out via tag/target-keyed decorators.
    // Phase 1: registration-decorator-tagged injectables. They register
    //   directly via registerSingle (no recursive decoration) to avoid
    //   bootstrap chaos.
    // Phase 2: regular injectables register through the decorator pipeline.
    const phase0Injectables = [];
    const registeredRegistrationDecoratorInjectables = [];
    const phase2Injectables = [];

    for (let i = 0; i < flatInjectables.length; i++) {
      const injectable = flatInjectables[i];

      if (
        isRelatedToToken(injectable.injectionToken, registrationDecoratorToken)
      ) {
        registerSingle(injectable, context);
        registeredRegistrationDecoratorInjectables.push(injectable);
      } else if (
        isRelatedToToken(injectable.injectionToken, instantiationDecoratorToken)
      ) {
        phase0Injectables.push(injectable);
      } else {
        phase2Injectables.push(injectable);
      }
    }

    let batchInProgress = true;
    const registeredInjectables = [];

    const fireCallbacksFor = injectable => {
      const callbacks = injectMany({
        alias: registrationCallbackToken,
        instantiationParameters: [],
        injectingInjectable: source,
      });

      for (let j = 0; j < callbacks.length; j++) {
        callbacks[j](injectable);
      }
    };

    const registerThroughPipeline = injectable => {
      const decorators = [
        ...injectMany({
          alias: registrationDecoratorToken.for(injectable),
          instantiationParameters: [],
          injectingInjectable: source,
        }),
        ...(injectable.injectionToken
          ? injectMany({
              alias: registrationDecoratorToken.for(injectable.injectionToken),
              instantiationParameters: [],
              injectingInjectable: source,
            })
          : []),
        ...getTagKeyedDecorators({
          token: registrationDecoratorToken,
          injectable,
          injectingInjectable: source,
        }),
      ];

      if (decorators.length === 0) {
        registerSingle(injectable, context);
        registeredInjectables.push(injectable);
        return;
      }

      let wasRegisteredThisInjectable = false;

      const boundRegisterSingle = inj => {
        registerSingle(inj, context);
        wasRegisteredThisInjectable = true;

        if (!batchInProgress) {
          fireCallbacksFor(inj);
        }
      };

      const decoratedRegister = flow(...decorators)(boundRegisterSingle);

      decoratedRegister(injectable);

      if (wasRegisteredThisInjectable) {
        registeredInjectables.push(injectable);
      }
    };

    phase0Injectables.forEach(registerThroughPipeline);
    phase2Injectables.forEach(registerThroughPipeline);

    batchInProgress = false;

    const callbacks = injectMany({
      alias: registrationCallbackToken,
      instantiationParameters: [],
      injectingInjectable: source,
    });

    const fireBatchCallbacks = injectable => {
      for (let j = 0; j < callbacks.length; j++) {
        callbacks[j](injectable);
      }
    };

    registeredRegistrationDecoratorInjectables.forEach(fireBatchCallbacks);
    registeredInjectables.forEach(fireBatchCallbacks);
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
    if (injectable.injectionToken?.abstract) {
      throw new Error(
        `Tried to register injectable "${namespacedId}" with injection token "${injectable.injectionToken.id}", but it is abstract. Use ".for(specifier)" for a concrete token.`,
      );
    }

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
