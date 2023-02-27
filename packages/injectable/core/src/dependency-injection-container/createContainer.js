import getInjectionToken from '../getInjectionToken/getInjectionToken';
import { privateInjectFor } from './inject';
import { withInjectionDecoratorsFor } from './withInjectionDecorators';
import { nonDecoratedPrivateInjectManyFor } from './injectMany';
import { registerFor, registerSingleFor } from './register';
import { purgeInstancesFor } from './purgeInstances';
import { deregisterFor } from './deregister';
import { overrideFor, unoverrideFor } from './override';
import { decorateFor, decorateFunctionFor } from './decorate';
import isInjectable from '../getInjectable/isInjectable';
import { getNamespacedIdFor } from './getNamespacedIdFor';

export default containerId => {
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

  const getNamespacedId = getNamespacedIdFor(injectableAndRegistrationContext);

  const getRelatedInjectables = getRelatedInjectablesFor({
    injectablesByInjectionToken,
    injectableSet,
  });

  const containerRootContextItem = { injectable: { id: containerId } };

  const nonDecoratedPrivateInjectManyForUnknownMeta =
    nonDecoratedPrivateInjectManyFor({
      containerRootContextItem,
      getRelatedInjectables,
      getInject: () => privateInject,
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
  });

  const getSideEffectsArePrevented = injectable =>
    sideEffectsArePrevented &&
    injectable.causesSideEffects &&
    !injectablesWithPermittedSideEffects.has(injectable);

  const privateInject = privateInjectFor({
    getRelatedInjectables,
    alreadyInjected,
    overridingInjectables,
    instancesByInjectableMap,
    injectableAndRegistrationContext,
    injectMany: nonDecoratedPrivateInjectMany,
    getSideEffectsArePrevented,
    getDi: () => privateDi,
    getNamespacedId,
  });

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
  });

  const privateRegister = registerFor({
    registerSingle,
    injectMany: nonDecoratedPrivateInjectMany,
  });

  const override = overrideFor({
    getRelatedInjectables,
    alreadyInjected,
    overridingInjectables,
  });

  const unoverride = unoverrideFor({ overridingInjectables });

  const decorateFunction = decorateFunctionFor({ decorate });

  const privateDi = {
    inject: privateInject,
    injectMany: decoratedPrivateInjectMany,
    injectManyWithMeta: decoratedPrivateInjectManyWithMeta,
    register: privateRegister,
    deregister,
    decorate,
    decorateFunction,
    override,
    unoverride,

    reset: () => {
      overridingInjectables.clear();
    },

    preventSideEffects: () => {
      sideEffectsArePrevented = true;
    },

    permitSideEffects: alias => {
      injectablesWithPermittedSideEffects.add(alias);
    },

    purge: purgeInstances,
  };

  const publicDi = {
    ...privateDi,

    inject: (alias, parameter, customContextItem) =>
      privateDi.inject(
        alias,
        parameter,
        customContextItem
          ? [containerRootContextItem, customContextItem]
          : [containerRootContextItem],
      ),

    injectMany: (alias, parameter, customContextItem) =>
      privateDi.injectMany(
        alias,
        parameter,
        customContextItem
          ? [containerRootContextItem, customContextItem]
          : [containerRootContextItem],
      ),

    register: (...injectables) => {
      privateDi.register({ injectables, context: [containerRootContextItem] });
    },

    injectManyWithMeta: (alias, parameter, customContextItem) =>
      privateDi.injectManyWithMeta(
        alias,
        parameter,
        customContextItem
          ? [containerRootContextItem, customContextItem]
          : [containerRootContextItem],
      ),
  };

  return publicDi;
};

const getRelatedInjectablesFor =
  ({ injectablesByInjectionToken, injectableSet }) =>
  alias =>
    isInjectable(alias)
      ? injectableSet.has(alias)
        ? [alias]
        : []
      : [...(injectablesByInjectionToken.get(alias)?.values() || [])];

export const registrationCallbackToken = getInjectionToken({
  id: 'registration-callback-token',
  decorable: false,
});

export const deregistrationCallbackToken = getInjectionToken({
  id: 'deregistration-callback-token',
  decorable: false,
});

export const instantiationDecoratorToken = getInjectionToken({
  id: 'instantiate-decorator-token',
  decorable: false,
});

export const injectionDecoratorToken = getInjectionToken({
  id: 'injection-decorator-token',
  decorable: false,
});
