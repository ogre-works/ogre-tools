import {
  deregistrationCallbackToken,
  deregistrationDecoratorToken,
  injectionDecoratorToken,
  instantiationDecoratorToken,
  registrationDecoratorToken,
} from './tokens';
import toFlatInjectables from './toFlatInjectables';
import isInjectionToken from '../getInjectionToken/isInjectionToken';
import { getRelatedTokens } from './getRelatedTokens';
import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import flow from './fastFlow';
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
    const callbacks = injectMany(
      deregistrationCallbackToken,
      [],
      source,
    );

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

    // Collect all deregistration decorators once
    const allDeregistrationDecorators = injectMany(
      deregistrationDecoratorToken,
      [],
      source,
    );

    // Deregister through decoration chain
    flatInjectables.forEach(injectable => {
      // Invalidate decorator caches when decorator injectables are deregistered
      if (injectable.injectionToken === injectionDecoratorToken) {
        decoratorCache.injection = null;
      } else if (injectable.injectionToken === instantiationDecoratorToken) {
        decoratorCache.instantiation = null;
      }

      const isDecorator =
        injectable.injectionToken === registrationDecoratorToken ||
        injectable.injectionToken === deregistrationDecoratorToken;

      // Fast path: no decorators, or injectable is a decorator itself, or not decorable
      if (
        isDecorator ||
        allDeregistrationDecorators.length === 0 ||
        injectable.decorable === false
      ) {
        deregisterSingle(injectable);
        return;
      }

      const relevantDecorators = allDeregistrationDecorators
        .filter(isRelevantDecoratorFor(injectable))
        .map(x => x.decorate);

      if (relevantDecorators.length === 0) {
        deregisterSingle(injectable);
        return;
      }

      const decoratedDeregister = flow(...relevantDecorators)(inj => {
        deregisterSingle(inj);
      });

      decoratedDeregister(injectable);
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
