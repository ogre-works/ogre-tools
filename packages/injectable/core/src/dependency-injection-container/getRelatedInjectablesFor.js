import isInjectable from '../getInjectable/isInjectable';

// Cached array per token — avoids spreading Set to Array on every inject() call.
// Invalidated by setting to null when the Set is mutated (register/deregister).
const arrayCache = new WeakMap();

const EMPTY = Object.freeze([]);

const getCachedArray = set => {
  let arr = arrayCache.get(set);

  if (!arr) {
    arr = [...set];
    arrayCache.set(set, arr);
  }

  return arr;
};

export const invalidateRelatedInjectablesCache = set => {
  arrayCache.delete(set);
};

export const getRelatedInjectablesFor =
  ({ injectablesByInjectionToken, injectableSet }) =>
  alias => {
    if (isInjectable(alias)) {
      return injectableSet.has(alias) ? [alias] : EMPTY;
    }

    const set = injectablesByInjectionToken.get(alias);

    if (!set || set.size === 0) {
      return EMPTY;
    }

    return getCachedArray(set);
  };
