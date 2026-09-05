// The ids of the scopes an alias was registered under, outermost first and
// the immediate owner last. Empty for container-level registrations, and for
// anything never registered (injection tokens, the container root).
const getScopeIdsFor = injectableAndRegistrationContext => alias => {
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

// The scope ids followed by the alias's own id — the segments of its
// namespaced id, which is these joined. Walks the registration tree on every
// call, so callers wanting it cheap should cache; the array is fresh per call
// and the caller's to keep.
export const getScopedIdFor = injectableAndRegistrationContext => {
  const getScopeIds = getScopeIdsFor(injectableAndRegistrationContext);

  return alias => {
    const ids = getScopeIds(alias);

    ids.push(alias.id);

    return ids;
  };
};
