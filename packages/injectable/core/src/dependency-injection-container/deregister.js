import {
  deregistrationCallbackToken,
  injectionDecoratorToken,
} from './tokens';
import toFlatInjectables from './toFlatInjectables';
import isInjectionToken from '../getInjectionToken/isInjectionToken';
import { getRelatedTokens, isRelatedToToken } from './getRelatedTokens';
import { invalidateRelatedInjectablesCache } from './getRelatedInjectablesFor';

export const deregisterFor =
  ({
    injectMany,
    injectableSet,
    injectableAndRegistrationContext,
    injectablesByInjectionToken,
    overridingInjectables,
    purgeInstances,
    injectableIdSet,
    namespacedIdByInjectableMap,
    childrenByParentMap,
    // Todo: get rid of function usage.
    getDi,
    decoratorCache,
  }) =>
  ({ injectables, context, source }) => {
    // Collect callbacks first (while all injectables are still registered)
    const callbacks = injectMany({
      alias: deregistrationCallbackToken,
      instantiationParameters: [],
      injectingInjectable: source,
    });

    const flatInjectables = toFlatInjectables(injectables);

    // Fire callbacks for all injectables being deregistered (original batch semantics)
    flatInjectables.forEach(injectable => {
      callbacks.forEach(callback => {
        callback(injectable);
      });
    });

    const di = getDi();

    const deregisterSingle = deregisterSingleFor({
      injectableSet,
      injectableAndRegistrationContext,
      injectablesByInjectionToken,
      overridingInjectables,
      purgeInstances,
      injectableIdSet,
      namespacedIdByInjectableMap,
      childrenByParentMap,
      di,
    });

    flatInjectables.forEach(injectable => {
      if (isRelatedToToken(injectable.injectionToken, injectionDecoratorToken)) {
        decoratorCache.injection = null;
      }

      deregisterSingle(injectable);
    });
  };

export const deregisterSingleFor =
  ({
    injectableSet,
    injectableAndRegistrationContext,
    injectablesByInjectionToken,
    overridingInjectables,
    purgeInstances,
    injectableIdSet,
    namespacedIdByInjectableMap,
    childrenByParentMap,
    di,
  }) =>
  injectable => {
    if (isInjectionToken(injectable)) {
      throw new Error(
        `Tried to deregister using injection token "${injectable.id}", but deregistration using token is illegal.`,
      );
    }

    if (!injectableSet.has(injectable)) {
      throw new Error(
        `Tried to deregister non-registered injectable "${injectable.id}".`,
      );
    }

    // Cascade deregister children using the reverse index (O(1) lookup).
    const children = childrenByParentMap.get(injectable);

    if (children) {
      children.forEach(child => {
        injectableAndRegistrationContext.delete(child);

        if (injectableSet.has(child)) {
          di.deregister({
            injectables: [child],
          });
        }
      });

      childrenByParentMap.delete(injectable);
    }

    purgeInstances(injectable);
    injectableAndRegistrationContext.delete(injectable);
    const namespacedId = namespacedIdByInjectableMap.get(injectable);
    injectableIdSet.delete(namespacedId);
    injectableSet.delete(injectable);
    namespacedIdByInjectableMap.delete(injectable);

    const tokens = getRelatedTokens(injectable.injectionToken);

    tokens.forEach(token => {
      const tokenSet = injectablesByInjectionToken.get(token);
      tokenSet.delete(injectable);
      invalidateRelatedInjectablesCache(tokenSet);
    });

    overridingInjectables.delete(injectable);
  };
