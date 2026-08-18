import { privateInjectFor } from './privateInjectFor';
import { withInjectionDecoratorsFor } from './withInjectionDecoratorsFor';
import { privateInjectManyFor as nonDecoratedPrivateInjectManyFor } from './privateInjectManyFor';
import { registerFor, registerSingleFor } from './register';
import { purgeInstancesFor } from './purgeInstances';
import { deregisterFor } from './deregister';
import { overrideFor, unoverrideFor } from './override';
import { getNamespacedIdFor } from './getNamespacedIdFor';
import { checkForNoMatchesFor } from './checkForNoMatchesFor';
import { checkForTooManyMatchesFor } from './checkForTooManyMatches';
import { checkForSideEffectsFor } from './checkForSideEffectsFor';
import { checkForAbstractTokenFor } from './checkForAbstractTokenFor';
import { getRelatedInjectablesFor } from './getRelatedInjectablesFor';
import { earlyOverrideFor, earlyOverride2For } from './early-override';
import { injectionDecoratorToken } from './tokens';
import { isRelatedToToken } from './getRelatedTokens';
import { firePurgeCallbacksFor } from './firePurgeCallbacksFor';
import { getApplicableDecoratorsFor } from './getApplicableDecoratorsFor';
import { isCompositeStorage } from './privateInjectFor';

export default containerId => {
  const injectableSet = new Set();

  const decoratorCache = { injection: null, injectionByAlias: new Map() };
  const overridingInjectables = new Map();
  let sideEffectsArePrevented = true;
  const alreadyInjected = new Set();
  const injectablesWithPermittedSideEffects = new Set();
  const injectableIdSet = new Set();

  const injectableAndRegistrationContext = new Map();
  const instancesByInjectableMap = new Map();
  const injectablesByInjectionToken = new Map();
  const namespacedIdByInjectableMap = new Map();
  const childrenByParentMap = new Map();

  const getNamespacedId = getNamespacedIdFor(injectableAndRegistrationContext);

  const getRelatedInjectables = getRelatedInjectablesFor({
    injectablesByInjectionToken,
    injectableSet,
  });

  const containerRootContextItem = {
    injectable: { id: containerId, aliasType: 'container' },
  };

  const rootInjectable = containerRootContextItem.injectable;

  const checkForAbstractToken = checkForAbstractTokenFor({ getNamespacedId });

  const nonDecoratedPrivateInjectManyForUnknownMeta =
    nonDecoratedPrivateInjectManyFor({
      getRelatedInjectables,
      getInject: () => privateDi.inject,
      namespacedIdByInjectableMap,
    });

  const nonDecoratedPrivateInjectMany =
    nonDecoratedPrivateInjectManyForUnknownMeta({
      withMeta: false,
    });

  const nonDecoratedPrivateInjectManyWithMeta =
    nonDecoratedPrivateInjectManyForUnknownMeta({
      withMeta: true,
    });

  const getApplicableDecorators = getApplicableDecoratorsFor({
    injectMany: nonDecoratedPrivateInjectMany,
    injectablesByInjectionToken,
  });

  const getSideEffectsArePrevented = injectable =>
    sideEffectsArePrevented &&
    injectable.causesSideEffects &&
    !injectablesWithPermittedSideEffects.has(injectable);

  const checkForSideEffects = checkForSideEffectsFor({
    getSideEffectsArePrevented,
    getNamespacedId,
  });

  const checkForNoMatches = checkForNoMatchesFor({
    getNamespacedId,
  });

  const checkForTooManyMatches = checkForTooManyMatchesFor({
    getNamespacedId,
  });

  const nonDecoratedPrivateInjectUnknownMeta = privateInjectFor({
    getRelatedInjectables,
    injectableSet,
    alreadyInjected,
    overridingInjectables,
    instancesByInjectableMap,
    getDi: () => privateDi,
    checkForNoMatches,
    checkForTooManyMatches,
    checkForSideEffects,
    checkForAbstractToken,
    namespacedIdByInjectableMap,
    getNamespacedId,
    getApplicableDecorators,
  });

  const nonDecoratedPrivateInject = nonDecoratedPrivateInjectUnknownMeta({
    withMeta: false,
  });

  const nonDecoratedPrivateInjectWithMeta =
    nonDecoratedPrivateInjectUnknownMeta({
      withMeta: true,
    });

  const withInjectionDecorators = withInjectionDecoratorsFor({
    decoratorCache,
    getApplicableDecorators,
  });

  // Injection decorators apply only on the per-injectable inject path.
  // injectMany resolves related injectables and calls the (decorated) inject
  // on each, so decorators still fire per element — but the token-level
  // injectMany is never wrapped.
  const decoratedPrivateInject = withInjectionDecorators(
    nonDecoratedPrivateInject,
  );

  const decoratedPrivateInjectWithMeta = withInjectionDecorators(
    nonDecoratedPrivateInjectWithMeta,
  );

  // Wires the decorated inject variants in only while at least one injection
  // decorator is registered, so the common no-decorator case pays no wrapper
  // frame at all. Every reader of `privateDi.inject` reads it at call time.
  const syncInjectionDecoration = () => {
    const registeredDecorators = injectablesByInjectionToken.get(
      injectionDecoratorToken,
    );

    const active =
      registeredDecorators !== undefined && registeredDecorators.size > 0;

    privateDi.inject = active
      ? decoratedPrivateInject
      : nonDecoratedPrivateInject;

    privateDi.injectWithMeta = active
      ? decoratedPrivateInjectWithMeta
      : nonDecoratedPrivateInjectWithMeta;
  };

  const firePurgeCallbacks = firePurgeCallbacksFor({
    getApplicableDecorators,
  });

  const rawRegisterSingle = registerSingleFor({
    injectableSet,
    namespacedIdByInjectableMap,
    instancesByInjectableMap,
    injectablesByInjectionToken,
    injectableIdSet,
    injectableAndRegistrationContext,
    childrenByParentMap,
    firePurgeCallbacks,
  });

  const registerSingle = (injectable, context) => {
    rawRegisterSingle(injectable, context);

    if (isRelatedToToken(injectable.injectionToken, injectionDecoratorToken)) {
      decoratorCache.injection = null;
      syncInjectionDecoration();
    }
  };

  const purgeInstances = purgeInstancesFor({
    getRelatedInjectables,
    instancesByInjectableMap,
    firePurgeCallbacks,
  });

  const deregister = deregisterFor({
    injectMany: nonDecoratedPrivateInjectMany,
    getApplicableDecorators,
    injectableSet,
    injectableAndRegistrationContext,
    injectablesByInjectionToken,
    overridingInjectables,
    purgeInstances,
    injectableIdSet,
    namespacedIdByInjectableMap,
    childrenByParentMap,
    // Todo: get rid of function usage.
    getDi: () => privateDi,
    decoratorCache,
    syncInjectionDecoration,
  });

  const privateRegister = registerFor({
    registerSingle,
    injectMany: nonDecoratedPrivateInjectMany,
    getApplicableDecorators,
  });

  const earlyOverride = earlyOverrideFor({
    getRelatedInjectables,
    alreadyInjected,
    overridingInjectables,
    getNamespacedId,
  });

  const earlyOverride2 = earlyOverride2For({
    getRelatedInjectables,
    alreadyInjected,
    overridingInjectables,
    getNamespacedId,
  });

  const override = overrideFor({
    getRelatedInjectables,
    earlyOverride,
  });

  const override2 = overrideFor({
    getRelatedInjectables,
    earlyOverride: earlyOverride2,
  });

  const unoverride = unoverrideFor({
    overridingInjectables,
    getRelatedInjectables,
    getNamespacedId,
  });

  const purgeAllButOverrides = () => {
    injectableSet.clear();
    alreadyInjected.clear();
    injectableIdSet.clear();
    injectableAndRegistrationContext.clear();
    instancesByInjectableMap.clear();
    injectablesByInjectionToken.clear();
    namespacedIdByInjectableMap.clear();
    childrenByParentMap.clear();
    decoratorCache.injection = null;
    syncInjectionDecoration();
  };

  // The immediate parent is the last registration context item; a missing
  // entry or a container-level parent normalizes to rootInjectable so that
  // scope comparisons work uniformly for root and nested scopes.
  const getImmediateScopeOf = injectable => {
    const context = injectableAndRegistrationContext.get(injectable);
    const immediateParent = context?.[context.length - 1]?.injectable;

    return !immediateParent || immediateParent.aliasType === 'container'
      ? rootInjectable
      : immediateParent;
  };

  const privateDi = {
    // Swapped by syncInjectionDecoration: the decorated variants are wired
    // in only while at least one injection decorator is registered, so the
    // common no-decorator case pays no wrapper frame at all.
    inject: nonDecoratedPrivateInject,
    injectWithMeta: nonDecoratedPrivateInjectWithMeta,
    injectMany: nonDecoratedPrivateInjectMany,
    injectManyWithMeta: nonDecoratedPrivateInjectManyWithMeta,

    injectFactory:
      alias =>
      (...params) =>
        publicInject(alias, ...params),

    register: privateRegister,
    deregister,
    override,
    override2,
    earlyOverride,
    earlyOverride2,
    unoverride,

    reset: () => {
      overridingInjectables.clear();
    },

    permitSideEffects: alias => {
      if (alias === undefined) {
        sideEffectsArePrevented = false;
        return;
      }

      getRelatedInjectables(alias).forEach(injectable =>
        injectablesWithPermittedSideEffects.add(injectable),
      );
    },

    purge: purgeInstances,

    scopedPurge: (scopeInjectable, alias, ...keyParts) => {
      // Storage shape is dispatched structurally: a CompositeMap holds
      // keyed entries (keyedSingleton); anything else is a directly-stored
      // instance (singleton or v2-default-no-args).
      const clearStoredFor = injectable => {
        const stored = instancesByInjectableMap.get(injectable);
        if (stored === undefined) return;
        if (isCompositeStorage(stored)) {
          stored.clear();
          return;
        }
        instancesByInjectableMap.delete(injectable);
      };

      if (alias === undefined) {
        clearStoredFor(scopeInjectable);

        const children = childrenByParentMap.get(scopeInjectable);
        if (children) {
          for (const child of children) {
            clearStoredFor(child);
          }
        }

        return;
      }

      const injectables = getRelatedInjectables(alias);
      const allowedChildren = childrenByParentMap.get(scopeInjectable);

      for (let i = 0; i < injectables.length; i++) {
        const injectable = injectables[i];

        if (
          injectable !== scopeInjectable &&
          !allowedChildren?.has(injectable)
        ) {
          throw new Error(
            `Tried to purge "${namespacedIdByInjectableMap.get(
              injectable,
            )}" from "${namespacedIdByInjectableMap.get(
              scopeInjectable,
            )}", but it is not within its registration context tree.`,
          );
        }
      }

      for (let i = 0; i < injectables.length; i++) {
        const injectable = injectables[i];
        const stored = instancesByInjectableMap.get(injectable);
        if (stored === undefined) continue;

        if (!isCompositeStorage(stored)) {
          if (keyParts.length === 0) {
            instancesByInjectableMap.delete(injectable);
          }
          // Non-empty keyParts on a directly-stored instance: cache key is
          // implicit, nothing to delete by prefix.
          continue;
        }

        if (keyParts.length === 0) {
          stored.clear();
        } else {
          stored.deleteByPrefix(keyParts);
        }
      }
    },

    purgeAllButOverrides,
    hasRegistrations: alias => !!getRelatedInjectables(alias).length,
    getNumberOfRegistrations: alias => getRelatedInjectables(alias).length,

    registeredInScopeOf: (scopeInjectable, alias) =>
      getRelatedInjectables(alias).some(
        injectable => getImmediateScopeOf(injectable) === scopeInjectable,
      ),

    registeredInSubtreeOf: (scopeInjectable, alias) =>
      getRelatedInjectables(alias).some(injectable => {
        let scope = getImmediateScopeOf(injectable);

        while (scope !== scopeInjectable && scope !== rootInjectable) {
          scope = getImmediateScopeOf(scope);
        }

        return scope === scopeInjectable;
      }),

    getNumberOfInstances: () => {
      const result = {};
      for (const [injectable, stored] of instancesByInjectableMap) {
        const namespacedId = namespacedIdByInjectableMap.get(injectable);
        if (!namespacedId) continue;

        let count = 0;
        if (isCompositeStorage(stored)) {
          for (const _ of stored.values()) count++;
        } else {
          count = 1;
        }
        if (count > 0) result[namespacedId] = count;
      }
      return result;
    },
  };

  const publicInject = (alias, ...args) =>
    privateDi.inject({
      alias,
      instantiationParameters: args,
      injectingInjectable: rootInjectable,
    });

  const publicInjectMany = (alias, ...args) =>
    privateDi.injectMany({
      alias,
      instantiationParameters: args,
      injectingInjectable: rootInjectable,
    });

  const publicInjectWithMeta = (alias, ...args) =>
    privateDi.injectWithMeta({
      alias,
      instantiationParameters: args,
      injectingInjectable: rootInjectable,
    });

  const publicInjectManyWithMeta = (alias, ...args) =>
    privateDi.injectManyWithMeta({
      alias,
      instantiationParameters: args,
      injectingInjectable: rootInjectable,
    });

  const publicDi = {
    ...privateDi,

    inject: publicInject,
    injectWithMeta: publicInjectWithMeta,
    injectMany: publicInjectMany,
    injectManyWithMeta: publicInjectManyWithMeta,

    inject2:
      alias =>
      (...params) =>
        publicInject(alias, ...params),

    injectMany2:
      alias =>
      (...params) =>
        publicInjectMany(alias, ...params),

    injectWithMeta2:
      alias =>
      (...params) =>
        publicInjectWithMeta(alias, ...params),

    injectManyWithMeta2:
      alias =>
      (...params) =>
        publicInjectManyWithMeta(alias, ...params),

    register: (...injectables) => {
      privateDi.register({
        injectables,
        context: [containerRootContextItem],
        source: rootInjectable,
      });
    },

    deregister: (...injectables) => {
      privateDi.deregister({
        injectables,
        context: [containerRootContextItem],
        source: rootInjectable,
      });
    },

    registeredInLocalScope: alias =>
      privateDi.registeredInScopeOf(rootInjectable, alias),

    registeredInLocalScopeSubtree: alias =>
      privateDi.registeredInSubtreeOf(rootInjectable, alias),
  };

  return publicDi;
};
