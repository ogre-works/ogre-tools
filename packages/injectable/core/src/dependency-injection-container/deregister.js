import { deregistrationCallbackToken } from './createContainer';

export const deregisterFor =
  ({
    injectMany,
    injectableSet,
    injectableAndRegistrationContext,
    injectablesByInjectionToken,
    overridingInjectables,
    purgeInstances,
    // Todo: get rid of function usage.
    getDi,
  }) =>
  (...injectables) => {
    const callbacks = injectMany(deregistrationCallbackToken);

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
      di,
    });

    injectables.forEach(injectable => {
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
        di.deregister(injectable);
      });

    purgeInstances(injectable);

    injectableSet.delete(injectable);

    if (injectable.injectionToken) {
      injectablesByInjectionToken
        .get(injectable.injectionToken)
        .delete(injectable);
    }

    overridingInjectables.delete(injectable);
  };
