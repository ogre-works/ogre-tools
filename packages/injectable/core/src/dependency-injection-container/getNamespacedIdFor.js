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

  return injectable => {
    const scopeIds = getScopeContextItems(injectable).map(x => x.injectable.id);

    return [...scopeIds, injectable.id].join(':');
  };
};
