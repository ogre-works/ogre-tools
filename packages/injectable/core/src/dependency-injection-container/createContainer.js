import getInjectionToken from '../getInjectionToken/getInjectionToken';
import { privateInjectFor } from './inject';
import { withInjectionDecoratorsFor } from './withInjectionDecorators';
import { nonDecoratedPrivateInjectManyFor } from './injectMany';
import { registerFor, registerSingleFor } from './register';
import { purgeInstancesFor } from './purgeInstances';
import { deregisterFor } from './deregister';
import { overrideFor, unoverrideFor } from './override';
import { decorateFor, decorateFunctionFor } from './decorate';

export default containerId => {
  let injectableMap = new Map();
  let overridingInjectables = new Map();
  let sideEffectsArePrevented = false;
  let alreadyInjected = new Set();

  const injectableAndRegistrationContext = new Map();
  const instancesByInjectableMap = new Map();
  const injectableIdsByInjectionToken = new Map();

  const getInjectablesHavingInjectionToken =
    getInjectablesHavingInjectionTokenFor({
      injectableMap,
      injectableIdsByInjectionToken,
    });

  const getRelatedInjectables = getRelatedInjectablesFor({
    injectableMap,
    getInjectablesHavingInjectionToken,
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

  const privateInject = privateInjectFor({
    getRelatedInjectables,
    alreadyInjected,
    overridingInjectables,
    instancesByInjectableMap,
    injectableAndRegistrationContext,
    injectMany: nonDecoratedPrivateInjectMany,
    // Todo: get rid of function usage.
    getSideEffectsArePrevented: () => sideEffectsArePrevented,
    getDi: () => privateDi,
  });

  const decoratedPrivateInjectMany = withInjectionDecorators(
    nonDecoratedPrivateInjectMany,
  );

  const decoratedPrivateInjectManyWithMeta = withInjectionDecorators(
    nonDecoratedPrivateInjectManyWithMeta,
  );

  const registerSingle = registerSingleFor({
    injectableMap,
    instancesByInjectableMap,
    injectableIdsByInjectionToken,
  });

  const purgeInstances = purgeInstancesFor({
    getRelatedInjectables,
    instancesByInjectableMap,
  });

  const decorate = decorateFor({ registerSingle });

  const deregister = deregisterFor({
    injectMany: nonDecoratedPrivateInjectMany,
    injectableMap,
    injectableAndRegistrationContext,
    injectableIdsByInjectionToken,
    overridingInjectables,
    purgeInstances,
    // Todo: get rid of function usage.
    getDi: () => privateDi,
  });

  const register = registerFor({
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
    register,
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
      getRelatedInjectables(alias)[0].permitSideEffects();
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

const getInjectablesHavingInjectionTokenFor =
  ({ injectableMap, injectableIdsByInjectionToken }) =>
  alias => {
    const idSetForInjectablesHavingInjectionToken =
      injectableIdsByInjectionToken.get(alias.id);

    const idsForInjectablesHavingInjectionToken =
      idSetForInjectablesHavingInjectionToken
        ? [...idSetForInjectablesHavingInjectionToken.values()]
        : [];

    return idsForInjectablesHavingInjectionToken.map(injectableId =>
      injectableMap.get(injectableId),
    );
  };

const getRelatedInjectablesFor =
  ({ injectableMap, getInjectablesHavingInjectionToken }) =>
  alias => {
    const injectable = injectableMap.get(alias.id);

    const injectablesHavingInjectionToken = getInjectablesHavingInjectionToken(
      alias,
    ).filter(x => x.id !== alias.id);

    return injectable
      ? [injectable, ...injectablesHavingInjectionToken]
      : injectablesHavingInjectionToken;
  };

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
