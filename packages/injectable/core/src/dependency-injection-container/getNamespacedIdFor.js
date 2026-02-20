import isInjectionToken from '../getInjectionToken/isInjectionToken';

export const getNamespacedIdFor = injectableAndRegistrationContext => {
  const getScopeContextItems = injectable => {
    const registrationContext =
      injectableAndRegistrationContext.get(injectable);

    if (!registrationContext) {
      return [];
    }

    const scopeContextItem = registrationContext
      .reverse()
      .find(x => x.injectable.scope);

    if (!scopeContextItem) {
      return [];
    }

    return [
      ...getScopeContextItems(scopeContextItem.injectable),
      scopeContextItem,
    ];
  };

  return alias => {
    const scopeIds = getScopeContextItems(alias).map(x => x.injectable.id);

    const injectableOrInjectionTokenId = isInjectionToken(alias)
      ? `(${alias.id})`
      : alias.id;

    return [...scopeIds, injectableOrInjectionTokenId].join(':');
  };
};
