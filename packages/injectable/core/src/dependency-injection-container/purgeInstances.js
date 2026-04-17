export const purgeInstancesFor =
  ({ getRelatedInjectables, instancesByInjectableMap }) =>
  (alias, ...keyParts) => {
    if (alias === undefined) {
      for (const instanceMap of instancesByInjectableMap.values()) {
        instanceMap.clear();
      }

      return;
    }

    const injectables = getRelatedInjectables(alias);

    for (let i = 0; i < injectables.length; i++) {
      const instanceMap = instancesByInjectableMap.get(injectables[i]);

      if (keyParts.length === 0) {
        instanceMap.clear();
      } else {
        instanceMap.deleteByPrefix(keyParts);
      }
    }
  };
