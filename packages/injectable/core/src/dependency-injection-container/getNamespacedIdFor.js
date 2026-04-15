import isInjectionToken from '../getInjectionToken/isInjectionToken';

export const getNamespacedIdFor = injectableAndRegistrationContext => {
  const getParentIds = injectable => {
    const registrationContext =
      injectableAndRegistrationContext.get(injectable);

    if (!registrationContext) {
      return [];
    }

    const parent = registrationContext[registrationContext.length - 1];

    if (!parent || parent.injectable.aliasType === 'container') {
      return [];
    }

    return [...getParentIds(parent.injectable), parent.injectable.id];
  };

  return alias => {
    const parentIds = getParentIds(alias);

    const id = isInjectionToken(alias) ? `(${alias.id})` : alias.id;

    return [...parentIds, id].join(':');
  };
};
