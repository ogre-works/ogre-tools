import { nonStoredInstanceKey } from './lifecycleEnum';
import flow from './fastFlow';
import { instantiationDecoratorToken } from './createContainer';
import { isRelevantDecoratorFor } from './isRelevantDecoratorFor';
import { withInjectionDecoratorsFor } from './withInjectionDecorators';

export const privateInjectFor = ({
  getRelatedInjectables,
  alreadyInjected,
  overridingInjectables,
  instancesByInjectableMap,
  injectableAndRegistrationContext,
  injectMany,
  // Todo: get rid of function usage.
  getSideEffectsArePrevented,
  getDi,
  getNamespacedId,
}) =>
  withInjectionDecoratorsFor({ injectMany })(
    (alias, instantiationParameter, context = []) => {
      const checkForNoMatches = checkForNoMatchesFor(getNamespacedId);

      const di = getDi();

      const relatedInjectables = getRelatedInjectables(alias);

      checkForTooManyMatches(relatedInjectables, alias);

      checkForNoMatches(relatedInjectables, alias, context);

      const originalInjectable = getRelatedInjectables(alias)[0];

      alreadyInjected.add(originalInjectable);

      const overriddenInjectable =
        overridingInjectables.get(originalInjectable);

      const injectable = overriddenInjectable || originalInjectable;

      if (getSideEffectsArePrevented(injectable)) {
        throw new Error(
          `Tried to inject "${[...context, { injectable }]
            .map(({ injectable }) => getNamespacedId(injectable))
            .join('" -> "')}" when side-effects are prevented.`,
        );
      }

      return getInstance({
        injectable,
        instantiationParameter,
        di,
        instancesByInjectableMap,
        context,
        injectableAndRegistrationContext,
      });
    },
  );

const checkForNoMatchesFor =
  getNamespacedId => (relatedInjectables, alias, context) => {
    if (relatedInjectables.length === 0) {
      const errorContextString = [...context, { injectable: { id: alias.id } }]
        .map(({ injectable }) => getNamespacedId(injectable))
        .join('" -> "');

      throw new Error(
        `Tried to inject non-registered injectable "${errorContextString}".`,
      );
    }
  };

const checkForTooManyMatches = (relatedInjectables, alias) => {
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

const getInstance = ({
  di,
  injectable: injectableToBeInstantiated,
  instantiationParameter,
  context: oldContext,
  instancesByInjectableMap,
  injectableAndRegistrationContext,
}) => {
  const newContext = [
    ...oldContext,

    {
      injectable: injectableToBeInstantiated,
      instantiationParameter,
    },
  ];

  const instanceMap = instancesByInjectableMap.get(
    injectableToBeInstantiated.overriddenInjectable ||
      injectableToBeInstantiated,
  );

  const minimalDi = {
    inject: (alias, parameter) => di.inject(alias, parameter, newContext),

    injectMany: (alias, parameter) =>
      di.injectMany(alias, parameter, newContext),

    injectManyWithMeta: (alias, parameter) =>
      di.injectManyWithMeta(alias, parameter, newContext),

    context: newContext,

    register: (...injectables) => {
      di.register({ injectables, context: newContext });
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
    ...(instantiationParameter === undefined ? [] : [instantiationParameter]),
  );

  if (instanceKey !== nonStoredInstanceKey) {
    instanceMap.set(instanceKey, newInstance);
  }

  return newInstance;
};

const withInstantiationDecoratorsFor = ({ injectMany, injectable }) => {
  const isRelevantDecorator = isRelevantDecoratorFor(injectable);

  return toBeDecorated =>
    (...args) => {
      if (injectable.decorable === false) {
        return toBeDecorated(...args);
      }

      const [{ context }] = args;

      const decorators = injectMany(
        instantiationDecoratorToken,
        undefined,
        context,
      )
        .filter(isRelevantDecorator)
        .map(x => x.decorate);

      const decorated = flow(...decorators)(toBeDecorated);

      return decorated(...args);
    };
};
