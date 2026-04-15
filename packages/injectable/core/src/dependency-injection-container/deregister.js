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
    // Todo: get rid of function usage.
    getDi,
    dependenciesByDependencyMap,
    dependeesByDependencyMap,
    decoratorCache,
  }) =>
  ({ injectables, context, source }) => {
    // Collect callbacks first (while all injectables are still registered)
    const callbacks = injectMany(
      deregistrationCallbackToken,
      undefined,
      context,
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
      di,
    });

    // Collect all deregistration decorators once
    const allDeregistrationDecorators = injectMany(
      deregistrationDecoratorToken,
      undefined,
      context,
      source,
    );

    // Deregister through decoration chain
    flatInjectables.forEach(injectable => {
      dependenciesByDependencyMap.delete(injectable);
      dependeesByDependencyMap.delete(injectable);

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

    [...injectableAndRegistrationContext.entries()]
      .filter(([, context]) =>
        context.find(contextItem => contextItem.injectable === injectable),
      )
      .map(x => x[0])
      .forEach(injectable => {
        injectableAndRegistrationContext.delete(injectable);

        if (injectableSet.has(injectable)) {
          di.deregister({
            injectables: [injectable],
          });
        }
      });

    purgeInstances(injectable);
    injectableAndRegistrationContext.delete(injectable);
    const namespacedId = namespacedIdByInjectableMap.get(injectable);
    injectableIdSet.delete(namespacedId);
    injectableSet.delete(injectable);
    namespacedIdByInjectableMap.delete(injectable);

    const tokens = getRelatedTokens(injectable.injectionToken);

    tokens.forEach(token => {
      injectablesByInjectionToken.get(token).delete(injectable);
    });

    overridingInjectables.delete(injectable);
  };
