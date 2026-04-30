import { getNamespacedIdFor } from './getNamespacedIdFor';
import {
  instantiationDecoratorToken,
  registrationCallbackToken,
  registrationDecoratorToken,
} from './tokens';
import toFlatInjectables from './toFlatInjectables';
import { LruCompositeMap } from '../composite-map/lru-composite-map';
import { getRelatedTokens, isRelatedToToken } from './getRelatedTokens';
import { invalidateRelatedInjectablesCache } from './getRelatedInjectablesFor';
import flow from './fastFlow';

export const registerFor =
  ({ registerSingle, injectMany, getApplicableDecorators }) =>
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
      const decorators = getApplicableDecorators({
        decoratorToken: registrationDecoratorToken,
        target: injectable,
        injectingInjectable: source,
      });

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

    // Skip the per-injectable forEach loop entirely when no registration
    // callbacks are wired up — this avoids 30k+ trivial function calls
    // during a 30k-injectable bootstrap with no callbacks (the perf-test
    // case and the common case).
    if (callbacks.length === 0) {
      return;
    }

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

    // Fast path: container-level registration (the dominant case) yields a
    // namespaced id equal to the bare id — skip the Map roundtrip + parent
    // walk inside getNamespacedId, and skip recording the registration
    // context altogether (`getNamespacedIdFor` and `deregister` both treat
    // a missing entry as "no nested context" already).
    const immediateParent =
      injectionContext.length > 0
        ? injectionContext[injectionContext.length - 1]
        : undefined;

    const isContainerLevel =
      !immediateParent ||
      immediateParent.injectable.aliasType === 'container';

    if (!isContainerLevel) {
      injectableAndRegistrationContext.set(injectable, injectionContext);
    }

    const namespacedId = isContainerLevel
      ? injectableId
      : getNamespacedId(injectable);

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

    // LRU is only meaningful for keyed lifecycles — singletons hold one
    // instance and would never overflow. For keyed lifecycles with a size
    // cap, allocate eagerly so the eviction callback is wired before any
    // store. For everything else, the map is allocated lazily on first
    // store (singletons store the instance directly; keyedSingleton stores
    // a CompositeMap — see privateInjectFor.js).
    if (maxCacheSize > 0 && injectable.lifecycle.id !== 'singleton') {
      const instanceMap = new LruCompositeMap(maxCacheSize, {
        onEvict: (instance, keyArray) =>
          firePurgeCallbacks(injectable, instance, keyArray),
      });

      instancesByInjectableMap.set(injectable, instanceMap);
    }

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
