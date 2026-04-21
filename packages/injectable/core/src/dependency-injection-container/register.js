import { getNamespacedIdFor } from './getNamespacedIdFor';
import { registrationCallbackToken } from './tokens';
import toFlatInjectables from './toFlatInjectables';
import { CompositeMap } from '../composite-map/composite-map';
import { LruCompositeMap } from '../composite-map/lru-composite-map';
import { getRelatedTokens } from './getRelatedTokens';
import { invalidateRelatedInjectablesCache } from './getRelatedInjectablesFor';

export const registerFor =
  ({ registerSingle, injectMany }) =>
  ({ injectables, context, source }) => {
    const flatInjectables = toFlatInjectables(injectables);

    for (let i = 0; i < flatInjectables.length; i++) {
      registerSingle(flatInjectables[i], context);
    }

    const callbacks = injectMany({
      alias: registrationCallbackToken,
      instantiationParameters: [],
      injectingInjectable: source,
    });

    for (let i = 0; i < flatInjectables.length; i++) {
      const injectable = flatInjectables[i];

      for (let j = 0; j < callbacks.length; j++) {
        callbacks[j](injectable);
      }
    }
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
