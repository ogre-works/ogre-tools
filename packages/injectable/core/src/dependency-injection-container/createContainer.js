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
import { checkForCyclesFor } from './checkForCyclesFor';
import { setDependeeFor } from './setDependeeFor';
import { checkForSideEffectsFor } from './checkForSideEffectsFor';
import { getRelatedInjectablesFor } from './getRelatedInjectablesFor';
import { noop } from 'lodash/fp';
import { earlyOverrideFor } from './early-override';

export default (containerId, { detectCycles = true } = {}) => {
  const injectableSet = new Set();
  const overridingInjectables = new Map();
  let sideEffectsArePrevented = false;
  const alreadyInjected = new Set();
  const injectablesWithPermittedSideEffects = new Set();
  const injectableIdSet = new Set();

  const injectableAndRegistrationContext = new Map();
  const instancesByInjectableMap = new Map();
  const injectablesByInjectionToken = new Map();
  const namespacedIdByInjectableMap = new Map();
  const dependeesByDependencyMap = new Map();
  const dependenciesByDependencyMap = new Map();

  const getNamespacedId = getNamespacedIdFor(injectableAndRegistrationContext);

  const getRelatedInjectables = getRelatedInjectablesFor({
    injectablesByInjectionToken,
    injectableSet,
  });

  const containerRootContextItem = { injectable: { id: containerId } };

  const setDependee = setDependeeFor({
    dependeesByDependencyMap,
    dependenciesByDependencyMap,
  });

  const nonDecoratedPrivateInjectManyForUnknownMeta =
    nonDecoratedPrivateInjectManyFor({
      containerRootContextItem,
      getRelatedInjectables,
      getInject: () => decoratedPrivateInject,
      setDependee,
      getNamespacedId,
    });

  const nonDecoratedPrivateInjectMany =
    nonDecoratedPrivateInjectManyForUnknownMeta({
      withMeta: false,
    });

  const nonDecoratedPrivateInjectManyWithMeta =
    nonDecoratedPrivateInjectManyForUnknownMeta({
      withMeta: true,
    });

  const checkForCycles = detectCycles
    ? checkForCyclesFor({
        dependeesByDependencyMap,
        getNamespacedId,
      })
    : noop;

  const withInjectionDecorators = withInjectionDecoratorsFor({
    injectMany: nonDecoratedPrivateInjectMany,
    setDependee,
    checkForCycles,
    dependenciesByDependencyMap,
  });

  const getSideEffectsArePrevented = injectable =>
    sideEffectsArePrevented &&
    injectable.causesSideEffects &&
    !injectablesWithPermittedSideEffects.has(injectable);

  const checkForNoMatches = checkForNoMatchesFor(getNamespacedId);

  const checkForSideEffects = checkForSideEffectsFor({
    getSideEffectsArePrevented,
    getNamespacedId,
  });

  const nonDecoratedPrivateInjectUnknownMeta = privateInjectFor({
    getRelatedInjectables,
    alreadyInjected,
    overridingInjectables,
    instancesByInjectableMap,
    getDi: () => privateDi,
    checkForNoMatches,
    checkForSideEffects,
    getNamespacedId,
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

  const registerSingle = registerSingleFor({
    injectableSet,
    namespacedIdByInjectableMap,
    instancesByInjectableMap,
    injectablesByInjectionToken,
    injectableIdSet,
    injectableAndRegistrationContext,
  });

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
    // Todo: get rid of function usage.
    getDi: () => privateDi,
    dependenciesByDependencyMap,
    dependeesByDependencyMap,
  });

  const privateRegister = registerFor({
    registerSingle,
    injectMany: nonDecoratedPrivateInjectMany,
  });

  const earlyOverride = earlyOverrideFor({
    getRelatedInjectables,
    alreadyInjected,
    overridingInjectables,
  });

  const override = overrideFor({
    getRelatedInjectables,
    earlyOverride,
  });

  const unoverride = unoverrideFor({
    overridingInjectables,
    getRelatedInjectables,
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
    dependeesByDependencyMap.clear();
    dependenciesByDependencyMap.clear();
  };

  const privateDi = {
    inject: decoratedPrivateInject,
    injectWithMeta: decoratedPrivateInjectWithMeta,
    injectMany: decoratedPrivateInjectMany,
    injectManyWithMeta: decoratedPrivateInjectManyWithMeta,

    injectFactory: alias => instantiationParameter =>
      publicInject(alias, instantiationParameter),

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
    purgeAllButOverrides,
  };

  const publicInject = (alias, parameter, customContextItem) =>
    privateDi.inject(
      alias,
      parameter,
      customContextItem
        ? [containerRootContextItem, customContextItem]
        : [containerRootContextItem],
      containerRootContextItem.injectable,
    );

  const getInjectionArgs = (alias, parameter, customContextItem) => [
    alias,
    parameter,
    customContextItem
      ? [containerRootContextItem, customContextItem]
      : [containerRootContextItem],
    containerRootContextItem.injectable,
  ];

  const publicDi = {
    ...privateDi,

    inject: publicInject,

    injectWithMeta: (alias, parameter, customContextItem) =>
      privateDi.injectWithMeta(
        ...getInjectionArgs(alias, parameter, customContextItem),
      ),

    injectMany: (alias, parameter, customContextItem) =>
      privateDi.injectMany(
        ...getInjectionArgs(alias, parameter, customContextItem),
      ),

    register: (...injectables) => {
      privateDi.register({
        injectables,
        context: [containerRootContextItem],
        source: containerRootContextItem.injectable,
      });
    },

    deregister: (...injectables) => {
      privateDi.deregister({
        injectables,
        context: [containerRootContextItem],
        source: containerRootContextItem.injectable,
      });
    },

    injectManyWithMeta: (alias, parameter, customContextItem) =>
      privateDi.injectManyWithMeta(
        ...getInjectionArgs(alias, parameter, customContextItem),
      ),

    getInstances: alias =>
      getRelatedInjectables(alias).flatMap(injectable => [
        ...instancesByInjectableMap.get(injectable).values(),
      ]),

    hasRegistrations: alias => !!getRelatedInjectables(alias).length,
  };

  return publicDi;
};
