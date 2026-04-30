import { storedInstanceKey } from './lifecycleEnum';
import { isCompositeStorage } from './privateInjectFor';

const singletonKeyArray = [storedInstanceKey];

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

    // Phase 1 — Gather snapshot tuples without mutating caches. The stored
    // value is dispatched structurally: a CompositeMap-shape stores keyed
    // entries; anything else is a directly-stored instance (singleton or
    // v2-default-no-args).
    const tuples = [];

    for (const injectable of injectablesInScope) {
      const stored = instancesByInjectableMap.get(injectable);
      if (stored === undefined) continue;

      if (!isCompositeStorage(stored)) {
        if (
          keyParts.length > 0 &&
          !keyArrayStartsWith(singletonKeyArray, keyParts)
        ) {
          continue;
        }
        tuples.push({
          injectable,
          instance: stored,
          keyArray: singletonKeyArray,
        });
        continue;
      }

      for (const [keyArray, instance] of stored.entries()) {
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
      const stored = instancesByInjectableMap.get(injectable);
      if (stored === undefined) continue;

      if (!isCompositeStorage(stored)) {
        if (
          keyParts.length === 0 ||
          keyArrayStartsWith(singletonKeyArray, keyParts)
        ) {
          instancesByInjectableMap.delete(injectable);
        }
        continue;
      }

      if (keyParts.length === 0) {
        stored.clear();
      } else {
        stored.deleteByPrefix(keyParts);
      }
    }
  };
