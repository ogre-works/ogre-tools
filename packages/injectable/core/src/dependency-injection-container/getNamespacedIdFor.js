import isInjectionToken from '../getInjectionToken/isInjectionToken';

export const getNamespacedIdFor = injectableAndRegistrationContext => {
  const getScopeIds = getScopeIdsFor(injectableAndRegistrationContext);

  return alias => {
    const id = isInjectionToken(alias) ? `(${alias.id})` : alias.id;

    // Fast path: container-level registration (the common case).
    // Context is [containerRootContextItem] — parent is the container itself.
    const registrationContext = injectableAndRegistrationContext.get(alias);

    if (!registrationContext) {
      return id;
    }

    const immediateParent = registrationContext[registrationContext.length - 1];

    if (
      !immediateParent ||
      immediateParent.injectable.aliasType === 'container'
    ) {
      return id;
    }

    // Slow path: nested registration — walk the parent chain.
    const ids = getScopeIds(alias);

    ids.push(id);
    return ids.join(':');
  };
};

// The ids of the scopes an injectable was registered under, outermost first
// and the immediate owner last — the segments of its namespaced id minus its
// own. Empty for container-level registrations. Walks the registration tree
// on every call, so callers wanting it cheap should cache; the array is
// fresh per call and the caller's to keep.
export const getScopeIdsFor = injectableAndRegistrationContext => alias => {
  const ids = [];
  let current = alias;

  while (true) {
    const context = injectableAndRegistrationContext.get(current);

    if (!context) {
      break;
    }

    const parent = context[context.length - 1];

    if (!parent || parent.injectable.aliasType === 'container') {
      break;
    }

    ids.push(parent.injectable.id);
    current = parent.injectable;
  }

  ids.reverse();
  return ids;
};
