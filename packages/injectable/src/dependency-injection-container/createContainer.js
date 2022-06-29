import flow from 'lodash/fp/flow';
import getInjectionToken from '../getInjectionToken/getInjectionToken';
import has from 'lodash/fp/has';
import isUndefined from 'lodash/fp/isUndefined';
import { nonStoredInstanceKey } from './lifecycleEnum';
import not from 'lodash/fp/negate';
import overSome from 'lodash/fp/overSome';
import some from 'lodash/fp/some';
import getInjectable from '../getInjectable/getInjectable';
import { isPromise } from '@ogre-tools/fp';

export default containerId => {
  let injectables = new Map();
  let overridingInjectables = new Map();
  let sideEffectsArePrevented = false;

  const injectableAndRegistrationContext = new Map();

  const injectableMap = new Map();

  const privateInject = (alias, instantiationParameter, context = []) => {
    checkForTooManyMatches(injectables, alias);

    const relatedInjectables = getRelatedInjectables({ injectables, alias });

    if (relatedInjectables.length === 0 && alias.adHoc === true) {
      privateDi.register(alias);
    } else {
      checkForNoMatches(injectables, alias, context);
    }

    const originalInjectable = getRelatedInjectable({
      injectables,
      alias,
    });

    const overriddenInjectable = overridingInjectables.get(
      originalInjectable.id,
    );

    const injectable = overriddenInjectable || originalInjectable;

    if (sideEffectsArePrevented && injectable.causesSideEffects) {
      throw new Error(
        `Tried to inject "${injectable.id}" when side-effects are prevented.`,
      );
    }

    return getInstance({
      injectable,
      instantiationParameter,
      di: privateDi,
      injectableMap,
      context,
      injectMany: nonDecoratedPrivateInjectMany,
      injectableAndRegistrationContext,
    });
  };

  const nonDecoratedPrivateInjectMany = (
    injectionToken,
    instantiationParameter,
    oldContext = [],
  ) => {
    const newContext = [...oldContext, { injectable: injectionToken }];

    const relatedInjectables = getRelatedInjectables({
      injectables,
      alias: injectionToken,
    });

    const injected = relatedInjectables.map(injectable =>
      decoratedPrivateInject(injectable, instantiationParameter, newContext),
    );

    if (some(isPromise, injected)) {
      return Promise.all(injected);
    }

    return injected;
  };

  const withInjectionDecorators = withInjectionDecoratorsFor({
    injectMany: nonDecoratedPrivateInjectMany,
  });

  const decoratedPrivateInject = withInjectionDecorators(privateInject);

  const decoratedPrivateInjectMany = withInjectionDecorators(
    nonDecoratedPrivateInjectMany,
  );

  const withRegistrationDecorators = withRegistrationDecoratorsFor(
    nonDecoratedPrivateInjectMany,
  );

  const withDeregistrationDecorators = withDeregistrationDecoratorsFor(
    nonDecoratedPrivateInjectMany,
  );

  const nonDecoratedRegister = (...externalInjectables) => {
    externalInjectables.forEach(externalInjectable => {
      if (!externalInjectable.id) {
        throw new Error('Tried to register injectable without ID.');
      }

      if (injectables.has(externalInjectable.id)) {
        throw new Error(
          `Tried to register multiple injectables for ID "${externalInjectable.id}"`,
        );
      }

      const internalInjectable = {
        ...externalInjectable,

        permitSideEffects: function () {
          this.causesSideEffects = false;
        },
      };

      injectables.set(internalInjectable.id, internalInjectable);

      injectableMap.set(internalInjectable.id, new Map());
    });
  };

  const purgeInstances = alias => {
    const injectable = getRelatedInjectable({
      injectables,
      alias,
    });

    injectableMap.get(injectable.id).clear();
  };

  const nonDecoratedDeregister = (...aliases) => {
    aliases.forEach(alias => {
      const relatedInjectable = injectables.get(alias.id);

      if (!relatedInjectable) {
        throw new Error(
          `Tried to deregister non-registered injectable "${alias.id}".`,
        );
      }

      [...injectableAndRegistrationContext.entries()]
        .filter(([, context]) =>
          context.find(contextItem => contextItem.injectable.id === alias.id),
        )
        .map(x => x[0])
        .forEach(injectable => {
          injectableAndRegistrationContext.delete(injectable);
          privateDi.deregister(injectable);
        });

      purgeInstances(alias);

      injectables.delete(alias.id);

      overridingInjectables.delete(alias.id);
    });
  };

  const register = withRegistrationDecorators(nonDecoratedRegister);

  const decorate = (alias, decorator) => {
    const decoratorInjectable = getInjectable({
      id: `${alias.id}-decorator-${Math.random()}`,
      injectionToken: injectionDecoratorToken,
      decorable: false,

      instantiate: () => ({
        decorate: decorator,
        target: alias,
      }),
    });

    register(decoratorInjectable);
  };

  const privateDi = {
    inject: decoratedPrivateInject,

    injectMany: decoratedPrivateInjectMany,

    register,

    deregister: withDeregistrationDecorators(nonDecoratedDeregister),

    decorate,

    decorateFunction: (alias, decorator) => {
      decorate(
        alias,
        toBeDecorated =>
          (...instantiation) =>
            decorator(toBeDecorated(...instantiation)),
      );
    },

    override: (alias, instantiateStub) => {
      const originalInjectable = injectables.get(alias.id);

      if (!originalInjectable) {
        throw new Error(
          `Tried to override "${alias.id}" which is not registered.`,
        );
      }

      overridingInjectables.set(originalInjectable.id, {
        ...originalInjectable,
        causesSideEffects: false,
        instantiate: instantiateStub,
      });
    },

    unoverride: alias => {
      overridingInjectables.delete(alias.id);
    },

    reset: () => {
      overridingInjectables.clear();
    },

    preventSideEffects: () => {
      sideEffectsArePrevented = true;
    },

    permitSideEffects: alias => {
      getRelatedInjectable({ injectables, alias }).permitSideEffects();
    },

    purge: purgeInstances,
  };

  const containerRootContextItem = { injectable: { id: containerId } };

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
  };

  return publicDi;
};

const isRelatedTo = alias => injectable =>
  injectable.id === alias.id ||
  (injectable.injectionToken && injectable.injectionToken.id === alias.id);

const getRelatedInjectable = ({ injectables, alias }) =>
  getRelatedInjectables({ injectables, alias })[0];

const getRelatedInjectables = ({ injectables, alias }) =>
  [...injectables.values()].filter(isRelatedTo(alias));

const getInstance = ({
  di,
  injectable: injectableToBeInstantiated,
  instantiationParameter,
  context: oldContext,
  injectableMap,
  injectableAndRegistrationContext,
}) => {
  const newContext = [
    ...oldContext,

    {
      injectable: injectableToBeInstantiated,
      instantiationParameter,
    },
  ];

  const injectableCausingCycle = oldContext
    .filter(contextItem => !contextItem.injectable.cannotCauseCycles)
    .find(
      contextItem =>
        contextItem.injectable.id === injectableToBeInstantiated.id,
    );

  if (injectableCausingCycle) {
    throw new Error(
      `Cycle of injectables encountered: "${newContext
        .map(x => x.injectable.id)
        .join('" -> "')}"`,
    );
  }

  const instanceMap = injectableMap.get(injectableToBeInstantiated.id);

  const minimalDi = {
    inject: (alias, parameter) => di.inject(alias, parameter, newContext),

    injectMany: (alias, parameter) =>
      di.injectMany(alias, parameter, newContext),

    context: newContext,

    register: (...injectables) => {
      injectables.forEach(injectableToBeRegistered => {
        injectableAndRegistrationContext.set(
          injectableToBeRegistered,
          newContext,
        );
      });

      return di.register(...injectables);
    },

    deregister: di.deregister,
  };

  const instanceKey = injectableToBeInstantiated.lifecycle.getInstanceKey(
    minimalDi,
    instantiationParameter,
  );

  const existingInstance = instanceMap.get(instanceKey);

  if (existingInstance) {
    return existingInstance;
  }

  const withInstantiationDecorators = withInstantiationDecoratorsFor({
    injectMany: di.injectMany,
    injectable: injectableToBeInstantiated,
  });

  const instantiateWithDecorators = withInstantiationDecorators(
    injectableToBeInstantiated.instantiate,
  );

  const newInstance = instantiateWithDecorators(
    minimalDi,
    ...(isUndefined(instantiationParameter) ? [] : [instantiationParameter]),
  );

  if (instanceKey !== nonStoredInstanceKey) {
    instanceMap.set(instanceKey, newInstance);
  }

  return newInstance;
};

export const registrationDecoratorToken = getInjectionToken({
  id: 'registration-decorator-token',
  decorable: false,
});

export const deregistrationDecoratorToken = getInjectionToken({
  id: 'deregistration-decorator-token',
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

const withRegistrationDecoratorsFor =
  injectMany =>
  toBeDecorated =>
  (...injectables) => {
    const decorators = injectMany(registrationDecoratorToken);

    const decorated = flow(...decorators)(toBeDecorated);

    decorated(...injectables);
  };

const withDeregistrationDecoratorsFor =
  injectMany =>
  toBeDecorated =>
  (...injectables) => {
    const decorators = injectMany(deregistrationDecoratorToken);

    const decorated = flow(...decorators)(toBeDecorated);

    decorated(...injectables);
  };

const withInstantiationDecoratorsFor = ({ injectMany, injectable }) => {
  const isRelevantDecorator = isRelevantDecoratorFor(injectable);

  return toBeDecorated => {
    return (...args) => {
      if (injectable.decorable === false) {
        return toBeDecorated(...args);
      }

      const decorators = injectMany(instantiationDecoratorToken)
        .filter(isRelevantDecorator)
        .map(x => x.decorate);

      const decorated = flow(...decorators)(toBeDecorated);

      return decorated(...args);
    };
  };
};

const withInjectionDecoratorsFor =
  ({ injectMany }) =>
  toBeDecorated =>
  (alias, ...args) => {
    if (alias.decorable === false) {
      return toBeDecorated(alias, ...args);
    }

    const isRelevantDecorator = isRelevantDecoratorFor(alias);

    const decorators = injectMany(injectionDecoratorToken)
      .filter(isRelevantDecorator)
      .map(x => x.decorate);

    const decorated = flow(...decorators)(toBeDecorated);

    return decorated(alias, ...args);
  };

const isGlobalDecorator = not(has('target'));

const isTargetedDecoratorFor = injectable => alias =>
  isRelatedTo(alias.target)(injectable);

const isRelevantDecoratorFor = injectable =>
  overSome([isGlobalDecorator, isTargetedDecoratorFor(injectable)]);

const checkForNoMatches = (injectables, alias, context) => {
  const relatedInjectables = getRelatedInjectables({
    injectables,
    alias,
  });

  if (relatedInjectables.length === 0) {
    const errorContextString = [...context, { injectable: { id: alias.id } }]
      .map(x => x.injectable.id)
      .join('" -> "');

    throw new Error(
      `Tried to inject non-registered injectable "${errorContextString}".`,
    );
  }
};

const checkForTooManyMatches = (injectables, alias) => {
  const relatedInjectables = getRelatedInjectables({
    injectables,
    alias,
  });

  if (relatedInjectables.length > 1) {
    throw new Error(
      `Tried to inject single injectable for injection token "${
        alias.id
      }" but found multiple injectables: "${relatedInjectables
        .map(relatedInjectable => relatedInjectable.id)
        .join('", "')}"`,
    );
  }
};
