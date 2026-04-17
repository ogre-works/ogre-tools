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
import { getRelatedInjectablesFor } from './getRelatedInjectablesFor';
import { earlyOverrideFor } from './early-override';
import { injectionDecoratorToken, instantiationDecoratorToken } from './tokens';

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

  const nonDecoratedPrivateInjectManyForUnknownMeta =
    nonDecoratedPrivateInjectManyFor({
      getRelatedInjectables,
      getInject: () => decoratedPrivateInject,
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

  const rawRegisterSingle = registerSingleFor({
    injectableSet,
    namespacedIdByInjectableMap,
    instancesByInjectableMap,
    injectablesByInjectionToken,
    injectableIdSet,
    injectableAndRegistrationContext,
    childrenByParentMap,
  });

  const registerSingle = (injectable, context) => {
    rawRegisterSingle(injectable, context);

    if (injectable.injectionToken === injectionDecoratorToken) {
      decoratorCache.injection = null;
    } else if (injectable.injectionToken === instantiationDecoratorToken) {
      decoratorCache.instantiation = null;
    }
  };

  const purgeInstances = purgeInstancesFor({
    getRelatedInjectables,
    instancesByInjectableMap,
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
      const injectables = getRelatedInjectables(alias);
      const allowedChildren = childrenByParentMap.get(scopeInjectable);

      for (let i = 0; i < injectables.length; i++) {
        const injectable = injectables[i];

        if (
          injectable !== scopeInjectable &&
          !allowedChildren?.has(injectable)
        ) {
          continue;
        }

        const instanceMap = instancesByInjectableMap.get(injectable);

        if (keyParts.length === 0) {
          instanceMap.clear();
        } else {
          instanceMap.deleteByPrefix(keyParts);
        }
      }
    },

    purgeAllButOverrides,
    hasRegistrations: alias => !!getRelatedInjectables(alias).length,
  };

  const publicInject = (alias, ...args) =>
    privateDi.inject(alias, args, rootInjectable, rootInjectable);

  const publicDi = {
    ...privateDi,

    inject: publicInject,

    injectWithMeta: (alias, ...args) =>
      privateDi.injectWithMeta(alias, args, rootInjectable, rootInjectable),

    injectMany: (alias, ...args) =>
      privateDi.injectMany(alias, args, rootInjectable, rootInjectable),

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

    injectManyWithMeta: (alias, ...args) =>
      privateDi.injectManyWithMeta(alias, args, rootInjectable, rootInjectable),

    getInstances: alias =>
      getRelatedInjectables(alias).flatMap(injectable => [
        ...instancesByInjectableMap.get(injectable).values(),
      ]),
  };

  return publicDi;
};
