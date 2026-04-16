import isInjectionToken from '../getInjectionToken/isInjectionToken';

export const getNamespacedIdFor = injectableAndRegistrationContext => {
  return alias => {
    const id = isInjectionToken(alias) ? `(${alias.id})` : alias.id;

    // Fast path: container-level registration (the common case).
    // Context is [containerRootContextItem] — parent is the container itself.
    const registrationContext = injectableAndRegistrationContext.get(alias);

    if (!registrationContext) {
      return id;
    }

    const immediateParent =
      registrationContext[registrationContext.length - 1];

    if (!immediateParent || immediateParent.injectable.aliasType === 'container') {
      return id;
    }

    // Slow path: nested registration — walk the parent chain.
    const ids = [immediateParent.injectable.id];
    let current = immediateParent.injectable;

    while (true) {
      const parentContext = injectableAndRegistrationContext.get(current);

      if (!parentContext) {
        break;
      }

      const parent = parentContext[parentContext.length - 1];

      if (!parent || parent.injectable.aliasType === 'container') {
        break;
      }

      ids.push(parent.injectable.id);
      current = parent.injectable;
    }

    ids.reverse();
    ids.push(id);
    return ids.join(':');
  };
};
