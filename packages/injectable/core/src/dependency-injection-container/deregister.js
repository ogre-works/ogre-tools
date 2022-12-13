import { deregistrationCallbackToken } from './createContainer';

export const deregisterFor =
  ({
    injectMany,
    injectableMap,
    injectableAndRegistrationContext,
    injectableIdsByInjectionToken,
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
      injectableMap,
      injectableAndRegistrationContext,
      injectableIdsByInjectionToken,
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
    injectableMap,
    injectableAndRegistrationContext,
    injectableIdsByInjectionToken,
    overridingInjectables,
    purgeInstances,
    di,
  }) =>
  alias => {
    const relatedInjectable = injectableMap.get(alias.id);

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
        di.deregister(injectable);
      });

    purgeInstances(alias);

    injectableMap.delete(alias.id);

    if (alias.injectionToken) {
      const tokenId = alias.injectionToken.id;

      const injectableIdSet = injectableIdsByInjectionToken.get(tokenId);

      injectableIdSet.delete(alias.id);
    }

    overridingInjectables.delete(alias.id);
  };
