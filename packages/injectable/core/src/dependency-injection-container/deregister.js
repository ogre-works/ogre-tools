import { deregistrationCallbackToken } from './tokens';
import toFlatInjectables from './toFlatInjectables';
import isInjectionToken from '../getInjectionToken/isInjectionToken';
import { getRelatedTokens } from './getRelatedTokens';

export const deregisterFor = ({
  injectMany,
  injectableSet,
  injectableAndRegistrationContext,
  injectablesByInjectionToken,
  overridingInjectables,
  purgeInstances,
  injectableIdSet,
  namespacedIdByInjectableMap,
  // Todo: get rid of function usage.
  getDi,
  dependenciesByDependencyMap,
  dependeesByDependencyMap,
  hasRegistrations,
  getBoundInjectableRegistrations,
  registeredBoundInjectablesSet,
}) => {
  const deregisterRecursed = ({ injectables, context, source }) => {
    injectables
      .flatMap(getBoundInjectableRegistrations)
      .filter(registration => registration.injectables.every(hasRegistrations))
      .forEach(deregisterRecursed);

    const callbacks = injectMany(
      deregistrationCallbackToken,
      undefined,
      context,
      source,
    );

    injectables.filter(hasRegistrations).forEach(injectable => {
      callbacks.forEach(callback => {
        callback(injectable);
      });
    });

    const di = getDi();

    const deregisterSingle = deregisterSingleFor({
      injectableSet,
      injectableAndRegistrationContext,
      injectablesByInjectionToken,
      overridingInjectables,
      purgeInstances,
      injectableIdSet,
      namespacedIdByInjectableMap,
      registeredBoundInjectablesSet,
      di,
    });

    toFlatInjectables(injectables).forEach(injectable => {
      if (
        !hasRegistrations(injectable) &&
        registeredBoundInjectablesSet.has(injectable)
      ) {
        registeredBoundInjectablesSet.delete(injectable);

        return;
      }

      dependenciesByDependencyMap.delete(injectable);
      dependeesByDependencyMap.delete(injectable);

      deregisterSingle(injectable);
    });
  };

  return deregisterRecursed;
};

export const deregisterSingleFor =
  ({
    injectableSet,
    injectableAndRegistrationContext,
    injectablesByInjectionToken,
    overridingInjectables,
    purgeInstances,
    injectableIdSet,
    namespacedIdByInjectableMap,
    di,
  }) =>
  injectable => {
    if (isInjectionToken(injectable)) {
      throw new Error(
        `Tried to deregister using injection token "${injectable.id}", but deregistration using token is illegal.`,
      );
    }

    if (!injectableSet.has(injectable)) {
      throw new Error(
        `Tried to deregister non-registered injectable "${injectable.id}".`,
      );
    }

    [...injectableAndRegistrationContext.entries()]
      .filter(([, context]) =>
        context.find(contextItem => contextItem.injectable === injectable),
      )
      .map(x => x[0])
      .forEach(injectable => {
        injectableAndRegistrationContext.delete(injectable);

        di.deregister({
          injectables: [injectable],
        });
      });

    purgeInstances(injectable);
    const namespacedId = namespacedIdByInjectableMap.get(injectable);
    injectableIdSet.delete(namespacedId);
    injectableSet.delete(injectable);
    namespacedIdByInjectableMap.delete(injectable);

    const tokens = getRelatedTokens(injectable.injectionToken);

    tokens.forEach(token => {
      injectablesByInjectionToken.get(token).delete(injectable);
    });

    overridingInjectables.delete(injectable);
  };
