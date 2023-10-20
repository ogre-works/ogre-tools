export function DeepMap(initialValues = []) {
  const internalMap = new Map();

  const instance = {
    set: ([key, ...keys], value) => {
      if (keys.length === 0) {
        internalMap.set(key, value);
        return;
      }

      if (!internalMap.has(key)) {
        internalMap.set(key, DeepMap());
      }

      internalMap.get(key).set(keys, value);
    },

    get: ([key, ...keys]) => {
      if (keys.length === 0) {
        return internalMap.get(key);
      } else {
        return internalMap.get(key)?.get(keys);
      }
    },

    has: ([key, ...keys]) => {
      return keys.length === 0
        ? internalMap.has(key)
        : internalMap.get(key)?.has(keys) ?? false;
    },

    values: () => internalMap.values(),
    keys: () => internalMap.keys(),
    entries: () => internalMap.entries(),
    clear: () => internalMap.clear(),
  };

  initialValues.forEach(([keys, value]) => {
    instance.set(keys, value);
  });

  return instance;
}
