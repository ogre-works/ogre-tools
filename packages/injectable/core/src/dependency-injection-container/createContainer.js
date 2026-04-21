import { privateInjectFor } from './privateInjectFor';
import { withInjectionDecoratorsFor } from './withInjectionDecoratorsFor';
import { privateInjectManyFor as nonDecoratedPrivateInjectManyFor } from './privateInjectManyFor';
import { registerFor, registerSingleFor } from './register';
import { purgeInstancesFor } from './purgeInstances';
import { deregisterFor } from './deregister';
import { overrideFor, unoverrideFor } from './override';
import { decorateFor, decorateFunctionFor } from './decorate';
import { getNamespacedIdFor } from './getNamespacedIdFor';
import { checkForNoMatchesFor } from './checkForNoMatchesFor';
import { checkForTooManyMatchesFor } from './checkForTooManyMatches';
import { checkForSideEffectsFor } from './checkForSideEffectsFor';
import { checkForAbstractTokenFor } from './checkForAbstractTokenFor';
import { getRelatedInjectablesFor } from './getRelatedInjectablesFor';
import { earlyOverrideFor } from './early-override';
import { injectionDecoratorToken, instantiationDecoratorToken } from './tokens';
import { isRelatedToToken } from './getRelatedTokens';
import { firePurgeCallbacksFor } from './firePurgeCallbacksFor';

export default containerId => {
  const injectableSet = new Set();

  // Cache for decorator lists — invalidated on decorator registration/deregistration
  const decoratorCache = {
    injection: null,
    injectionByAlias: new Map(),
    instantiation: null,
  };
  const overridingInjectables = new Map();
  let sideEffectsArePrevented = false;
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
      getInject: () => decoratedPrivateInject,
      checkForAbstractToken,
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

  const withInjectionDecorators = withInjectionDecoratorsFor({
    injectMany: nonDecoratedPrivateInjectMany,
    decoratorCache,
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
    decoratorCache,
  });

  const nonDecoratedPrivateInject = nonDecoratedPrivateInjectUnknownMeta({
    withMeta: false,
  });

  const nonDecoratedPrivateInjectWithMeta =
    nonDecoratedPrivateInjectUnknownMeta({
      withMeta: true,
    });

  const decoratedPrivateInject = withInjectionDecorators(
    nonDecoratedPrivateInject,
  );

  const decoratedPrivateInjectWithMeta = withInjectionDecorators(
    nonDecoratedPrivateInjectWithMeta,
  );

  const decoratedPrivateInjectMany = withInjectionDecorators(
    nonDecoratedPrivateInjectMany,
  );

  const decoratedPrivateInjectManyWithMeta = withInjectionDecorators(
    nonDecoratedPrivateInjectManyWithMeta,
  );

  const firePurgeCallbacks = firePurgeCallbacksFor({
    injectMany: nonDecoratedPrivateInjectMany,
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
    } else if (isRelatedToToken(injectable.injectionToken, instantiationDecoratorToken)) {
      decoratorCache.instantiation = null;
    }
  };

  const purgeInstances = purgeInstancesFor({
    getRelatedInjectables,
    instancesByInjectableMap,
    firePurgeCallbacks,
  });

  const decorate = decorateFor({ registerSingle });

  const deregister = deregisterFor({
    injectMany: nonDecoratedPrivateInjectMany,
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
  });

  const privateRegister = registerFor({
    registerSingle,
    injectMany: nonDecoratedPrivateInjectMany,
  });

  const earlyOverride = earlyOverrideFor({
    getRelatedInjectables,
    alreadyInjected,
    overridingInjectables,
    getNamespacedId,
  });

  const override = overrideFor({
    getRelatedInjectables,
    earlyOverride,
  });

  const unoverride = unoverrideFor({
    overridingInjectables,
    getRelatedInjectables,
    getNamespacedId,
  });

  const decorateFunction = decorateFunctionFor({ decorate });

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
    decoratorCache.instantiation = null;
  };

  const privateDi = {
    inject: decoratedPrivateInject,
    injectWithMeta: decoratedPrivateInjectWithMeta,
    injectMany: decoratedPrivateInjectMany,
    injectManyWithMeta: decoratedPrivateInjectManyWithMeta,

    injectFactory:
      alias =>
      (...params) =>
        publicInject(alias, ...params),

    register: privateRegister,
    deregister,
    decorate,
    decorateFunction,
    override,
    earlyOverride,
    unoverride,

    reset: () => {
      overridingInjectables.clear();
    },

    preventSideEffects: () => {
      sideEffectsArePrevented = true;
    },

    permitSideEffects: alias => {
      getRelatedInjectables(alias).forEach(injectable =>
        injectablesWithPermittedSideEffects.add(injectable),
      );
    },

    purge: purgeInstances,

    scopedPurge: (scopeInjectable, alias, ...keyParts) => {
      if (alias === undefined) {
        const selfMap = instancesByInjectableMap.get(scopeInjectable);
        if (selfMap) selfMap.clear();

        const children = childrenByParentMap.get(scopeInjectable);
        if (children) {
          for (const child of children) {
            instancesByInjectableMap.get(child)?.clear();
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
        const instanceMap = instancesByInjectableMap.get(injectables[i]);

        if (keyParts.length === 0) {
          instanceMap.clear();
        } else {
          instanceMap.deleteByPrefix(keyParts);
        }
      }
    },

    purgeAllButOverrides,
    hasRegistrations: alias => !!getRelatedInjectables(alias).length,

    getNumberOfInstances: () => {
      const result = {};
      for (const [injectable, instanceMap] of instancesByInjectableMap) {
        const namespacedId = namespacedIdByInjectableMap.get(injectable);
        if (!namespacedId) continue;
        let count = 0;
        for (const _ of instanceMap.values()) count++;
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
  };

  return publicDi;
};
