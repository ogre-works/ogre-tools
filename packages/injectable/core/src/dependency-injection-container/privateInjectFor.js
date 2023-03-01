import { nonStoredInstanceKey } from './lifecycleEnum';
import { withInjectionDecoratorsFor } from './withInjectionDecoratorsFor';
import { withInstantiationDecoratorsFor } from './withInstantiationDecoratorsFor';
import { checkForTooManyMatches } from './checkForTooManyMatches';

export const privateInjectFor = ({
  getRelatedInjectables,
  alreadyInjected,
  overridingInjectables,
  instancesByInjectableMap,
  injectMany,
  getDi,
  setDependee,
  checkForNoMatches,
  checkForCycles,
  checkForSideEffects,
}) =>
  withInjectionDecoratorsFor({ injectMany, setDependee, checkForCycles })(
    (alias, instantiationParameter, context = []) => {
      const di = getDi();

      const relatedInjectables = getRelatedInjectables(alias);

      checkForTooManyMatches(relatedInjectables, alias);
      checkForNoMatches(relatedInjectables, alias, context);

      const originalInjectable = getRelatedInjectables(alias)[0];

      alreadyInjected.add(originalInjectable);

      const overriddenInjectable =
        overridingInjectables.get(originalInjectable);

      const injectable = overriddenInjectable || originalInjectable;

      checkForSideEffects(injectable, context);

      return getInstance({
        di,
        injectable,
        instantiationParameter,
        context,
        instancesByInjectableMap,
      });
    },
  );

const getInstance = ({
  di,
  injectable: injectableToBeInstantiated,
  instantiationParameter,
  context: oldContext,
  instancesByInjectableMap,
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
    inject: (alias, parameter) =>
      di.inject(alias, parameter, newContext, injectableToBeInstantiated),

    injectMany: (alias, parameter) =>
      di.injectMany(alias, parameter, newContext, injectableToBeInstantiated),

    injectManyWithMeta: (alias, parameter) =>
      di.injectManyWithMeta(
        alias,
        parameter,
        newContext,
        injectableToBeInstantiated,
      ),

    context: newContext,

    register: (...injectables) => {
      di.register({
        injectables,
        context: newContext,
        source: injectableToBeInstantiated,
      });
    },

    deregister: (...injectables) => {
      di.deregister({
        injectables,
        context: newContext,
        source: injectableToBeInstantiated,
      });
    },
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
