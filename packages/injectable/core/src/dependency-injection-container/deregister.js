import { deregistrationCallbackToken } from './tokens';
import toFlatInjectables from './toFlatInjectables';

export const deregisterFor =
  ({
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
  }) =>
  ({ injectables, context, source }) => {
    const callbacks = injectMany(deregistrationCallbackToken, context, source);

    injectables.forEach(injectable => {
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
      di,
    });

    toFlatInjectables(injectables).forEach(injectable => {
      dependenciesByDependencyMap.delete(injectable);
      dependeesByDependencyMap.delete(injectable);

      deregisterSingle(injectable);
    });
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

    if (injectable.injectionToken) {
      injectablesByInjectionToken
        .get(injectable.injectionToken)
        .delete(injectable);
    }

    overridingInjectables.delete(injectable);
  };
