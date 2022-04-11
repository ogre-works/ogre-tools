import forEach from 'lodash/fp/forEach';
import conforms from 'lodash/fp/conforms';
import filter from 'lodash/fp/filter';
import find from 'lodash/fp/find';
import findLast from 'lodash/fp/findLast';
import first from 'lodash/fp/first';
import get from 'lodash/fp/get';
import getInjectionToken from '../getInjectionToken/getInjectionToken';
import has from 'lodash/fp/has';
import isUndefined from 'lodash/fp/isUndefined';
import { nonStoredInstanceKey } from './lifecycleEnum';
import map from 'lodash/fp/map';
import matches from 'lodash/fp/matches';
import not from 'lodash/fp/negate';
import reject from 'lodash/fp/reject';
import { pipeline } from '@ogre-tools/fp';
import curry from 'lodash/fp/curry';
import nth from 'lodash/fp/nth';
import overSome from 'lodash/fp/overSome';

export default () => {
  let injectables = [];
  let overridingInjectables = [];
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
      context,
    });

    const overriddenInjectable = getOverridingInjectable({
      overridingInjectables,
      alias,
    });

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

    return pipeline(
      getRelatedInjectables({
        injectables,
        alias: injectionToken,
      }),

      map(injectable =>
        decoratedPrivateInject(injectable, instantiationParameter, newContext),
      ),
    );
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

      if (injectables.find(matches({ id: externalInjectable.id }))) {
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

      injectables.push(internalInjectable);

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
      const relatedInjectable = pipeline(injectables, find(isRelatedTo(alias)));

      if (!relatedInjectable) {
        throw new Error(
          `Tried to deregister non-registered injectable "${alias.id}".`,
        );
      }

      pipeline(
        [...injectableAndRegistrationContext.entries()],

        filter(([, context]) =>
          context.find(matches({ injectable: { id: alias.id } })),
        ),

        map(nth(0)),

        forEach(injectable => {
          injectableAndRegistrationContext.delete(injectable);
          privateDi.deregister(injectable);
        }),
      );

      purgeInstances(alias);

      injectables = pipeline(injectables, reject(isRelatedTo(alias)));

      overridingInjectables = pipeline(
        overridingInjectables,
        reject(isRelatedTo(alias)),
      );
    });
  };

  const privateDi = {
    inject: decoratedPrivateInject,

    injectMany: decoratedPrivateInjectMany,

    register: withRegistrationDecorators(nonDecoratedRegister),

    deregister: withDeregistrationDecorators(nonDecoratedDeregister),

    override: (alias, instantiateStub) => {
      const originalInjectable = pipeline(
        injectables,
        find(isRelatedTo(alias)),
      );

      if (!originalInjectable) {
        throw new Error(
          `Tried to override "${alias.id}" which is not registered.`,
        );
      }

      overridingInjectables.push({
        ...originalInjectable,
        causesSideEffects: false,
        instantiate: instantiateStub,
      });
    },

    unoverride: alias => {
      overridingInjectables = pipeline(
        overridingInjectables,
        reject(isRelatedTo(alias)),
      );
    },

    reset: () => {
      overridingInjectables = [];
    },

    preventSideEffects: () => {
      sideEffectsArePrevented = true;
    },

    permitSideEffects: alias => {
      getRelatedInjectable({ injectables, alias }).permitSideEffects();
    },

    purge: purgeInstances,
  };

  const publicDi = {
    ...privateDi,

    inject: (alias, parameter, customContextItem) =>
      privateDi.inject(
        alias,
        parameter,
        customContextItem ? [customContextItem] : undefined,
      ),

    injectMany: (alias, parameter, customContextItem) =>
      privateDi.injectMany(
        alias,
        parameter,
        customContextItem ? [customContextItem] : undefined,
      ),
  };

  return publicDi;
};

const isRelatedTo = curry(
  (alias, injectable) =>
    injectable.id === alias.id ||
    (injectable.injectionToken && injectable.injectionToken === alias),
);

const getRelatedInjectable = ({ injectables, alias }) =>
  pipeline(getRelatedInjectables({ injectables, alias }), first);

const getRelatedInjectables = ({ injectables, alias }) =>
  pipeline(injectables, filter(isRelatedTo(alias)));

const getOverridingInjectable = ({ overridingInjectables, alias }) =>
  pipeline(overridingInjectables, findLast(isRelatedTo(alias)));

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

  const injectableCausingCycle = pipeline(
    oldContext,
    find(
      contextItem =>
        contextItem.injectable.id === injectableToBeInstantiated.id,
    ),
  );

  if (injectableCausingCycle) {
    throw new Error(
      `Cycle of injectables encountered: "${newContext
        .map(get('injectable.id'))
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

  const instantiateWithDecorators = pipeline(
    injectableToBeInstantiated.instantiate,

    withInstantiationDecoratorsFor({
      injectMany: di.injectMany,
      injectable: injectableToBeInstantiated,
    }),
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

    pipeline(toBeDecorated, ...decorators)(...injectables);
  };

const withDeregistrationDecoratorsFor =
  injectMany =>
  toBeDecorated =>
  (...injectables) => {
    const decorators = injectMany(deregistrationDecoratorToken);

    pipeline(toBeDecorated, ...decorators)(...injectables);
  };

const withInstantiationDecoratorsFor = ({ injectMany, injectable }) => {
  const isRelevantDecorator = isRelevantDecoratorFor(injectable);

  return toBeDecorated =>
    (...args) => {
      if (injectable.decorable === false) {
        return toBeDecorated(...args);
      }

      const decorators = pipeline(
        injectMany(instantiationDecoratorToken),
        filter(isRelevantDecorator),
        map('decorate'),
      );

      return pipeline(toBeDecorated, ...decorators)(...args);
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

    const decorators = pipeline(
      injectMany(injectionDecoratorToken),
      filter(isRelevantDecorator),
      map('decorate'),
    );

    return pipeline(toBeDecorated, ...decorators)(alias, ...args);
  };

const isGlobalDecorator = not(has('target'));

const isTargetedDecoratorFor = injectable =>
  conforms({
    target: alias => isRelatedTo(alias, injectable),
  });

const isRelevantDecoratorFor = injectable =>
  overSome([isGlobalDecorator, isTargetedDecoratorFor(injectable)]);

const checkForNoMatches = (injectables, alias, context) => {
  const relatedInjectables = getRelatedInjectables({
    injectables,
    alias,
  });

  if (relatedInjectables.length === 0) {
    const errorContextString = [...context, { injectable: { id: alias.id } }]
      .map(get('injectable.id'))
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
