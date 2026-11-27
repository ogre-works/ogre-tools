import {
  deregistrationCallbackToken,
  deregistrationDecoratorToken,
  injectionDecoratorToken,
  preInjectCallbackToken,
} from './tokens';
import toFlatInjectables from './toFlatInjectables';
import isInjectionToken from '../getInjectionToken/isInjectionToken';
import { getRelatedTokens, isRelatedToToken } from './getRelatedTokens';
import { invalidateRelatedInjectablesCache } from './getRelatedInjectablesFor';
import flow from './fastFlow';

export const deregisterFor =
  ({
    injectMany,
    getApplicableDecorators,
    injectableSet,
    injectableAndRegistrationContext,
    injectablesByInjectionToken,
    overridingInjectables,
    purgeInstances,
    injectableIdSet,
    namespacedIdByInjectableMap,
    childrenByParentMap,
    alreadyInjected,
    rootInjectable,
    // Todo: get rid of function usage.
    getDi,
    decoratorCache,
    syncInjectWiring,
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
      alreadyInjected,
      rootInjectable,
      di,
    });

    let injectWiringChanged = false;

    flatInjectables.forEach(injectable => {
      if (
        isRelatedToToken(injectable.injectionToken, injectionDecoratorToken)
      ) {
        decoratorCache.injection = null;
        injectWiringChanged = true;
      }

      if (isRelatedToToken(injectable.injectionToken, preInjectCallbackToken)) {
        decoratorCache.preInject = null;
        injectWiringChanged = true;
      }

      const decorators = getApplicableDecorators({
        decoratorToken: deregistrationDecoratorToken,
        target: injectable,
        injectingInjectable: source,
      });

      if (decorators.length === 0) {
        deregisterSingle(injectable);
        return;
      }

      const decoratedDeregister = flow(...decorators)(deregisterSingle);

      decoratedDeregister(injectable);
    });

    // Recomputed from the registration index after the removals, so a
    // deregistration decorator that prevented the removal is handled too.
    if (injectWiringChanged) {
      syncInjectWiring();
    }
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
    alreadyInjected,
    rootInjectable,
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
      // Detached first: deregistering a child takes it out of the children
      // of its parents, which would otherwise mutate the set being iterated.
      childrenByParentMap.delete(injectable);

      children.forEach(child => {
        injectableAndRegistrationContext.delete(child);

        if (injectableSet.has(child)) {
          di.deregister({
            injectables: [child],
          });
        }
      });
    }

    // Nothing may keep the injectable once it is deregistered: the container
    // outlives it, so whatever its instantiate holds would stay reachable.
    // Registration recorded it as a child of each parent in its context, which
    // is stored for a nested registration and, for a container-level one, is
    // the container's root. A child the cascade above deregisters has lost
    // its context already, but the only set it was in is its parent's, which
    // the cascade detached, so there is nothing left to take it out of.
    const registrationContext =
      injectableAndRegistrationContext.get(injectable);

    if (registrationContext) {
      for (let i = 0; i < registrationContext.length; i++) {
        childrenByParentMap
          .get(registrationContext[i].injectable)
          ?.delete(injectable);
      }
    } else {
      childrenByParentMap.get(rootInjectable)?.delete(injectable);
    }

    alreadyInjected.delete(injectable);

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
