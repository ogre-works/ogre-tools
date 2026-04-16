import isInjectionToken from '../getInjectionToken/isInjectionToken';

export const getNamespacedIdFor = injectableAndRegistrationContext => {
  const getParentIds = injectable => {
    const ids = [];
    let current = injectable;

    while (true) {
      const registrationContext =
        injectableAndRegistrationContext.get(current);

      if (!registrationContext) {
        break;
      }

      const parent = registrationContext[registrationContext.length - 1];

      if (!parent || parent.injectable.aliasType === 'container') {
        break;
      }

      ids.push(parent.injectable.id);
      current = parent.injectable;
    }

    ids.reverse();
    return ids;
  };

  return alias => {
    const parentIds = getParentIds(alias);

    const id = isInjectionToken(alias) ? `(${alias.id})` : alias.id;

    parentIds.push(id);
    return parentIds.join(':');
  };
};
