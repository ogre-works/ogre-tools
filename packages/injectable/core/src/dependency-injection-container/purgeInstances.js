const keyArrayStartsWith = (keyArray, prefix) => {
  if (prefix.length > keyArray.length) return false;
  for (let i = 0; i < prefix.length; i++) {
    if (keyArray[i] !== prefix[i]) return false;
  }
  return true;
};

export const purgeInstancesFor =
  ({ getRelatedInjectables, instancesByInjectableMap, firePurgeCallbacks }) =>
  (alias, ...keyParts) => {
    // Resolve which injectables are in scope
    const injectablesInScope =
      alias === undefined
        ? [...instancesByInjectableMap.keys()]
        : getRelatedInjectables(alias);

    // Phase 1 — Gather snapshot tuples without mutating caches
    const tuples = [];

    for (const injectable of injectablesInScope) {
      const instanceMap = instancesByInjectableMap.get(injectable);
      if (!instanceMap) continue;

      for (const [keyArray, instance] of instanceMap.entries()) {
        if (keyParts.length > 0 && !keyArrayStartsWith(keyArray, keyParts)) {
          continue;
        }
        tuples.push({ injectable, instance, keyArray });
      }
    }

    // Phase 2 — Fire callbacks. Caches stay populated so peer-coordination
    // inside a callback works (`di.inject(peer)` returns the cached instance).
    for (const { injectable, instance, keyArray } of tuples) {
      firePurgeCallbacks(injectable, instance, keyArray);
    }

    // Phase 3 — Evict. Sweeps both the original snapshot entries and anything
    // re-populated by phase 2 callbacks. Callbacks do NOT re-fire here.
    for (const injectable of injectablesInScope) {
      const instanceMap = instancesByInjectableMap.get(injectable);
      if (!instanceMap) continue;

      if (keyParts.length === 0) {
        instanceMap.clear();
      } else {
        instanceMap.deleteByPrefix(keyParts);
      }
    }
  };
