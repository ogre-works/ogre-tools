const isObjectKey = key =>
  (typeof key === 'object' && key !== null) || typeof key === 'function';

const makeNode = () => ({
  layer: new Map(),
  weakLayer: new WeakMap(),
  children: new Map(),
  weakChildren: new WeakMap(),
  hasWeakEntries: false,
});

export class CompositeMap {
  #internalMap = makeNode();

  constructor(initialValues = []) {
    for (const [key, value] of initialValues) {
      this.set(key, value);
    }
  }

  #layerFor(mapEntry, key) {
    return isObjectKey(key) ? mapEntry.weakLayer : mapEntry.layer;
  }

  #childrenFor(mapEntry, key) {
    return isObjectKey(key) ? mapEntry.weakChildren : mapEntry.children;
  }

  #set(mapEntry, key, value) {
    if (key.length === 1) {
      const first = key[0];
      this.#layerFor(mapEntry, first).set(first, value);
      if (isObjectKey(first)) mapEntry.hasWeakEntries = true;
    } else {
      const [first, ...rest] = key;
      const childMap = this.#childrenFor(mapEntry, first);
      let nextMapEntry = childMap.get(first);

      if (!nextMapEntry) {
        nextMapEntry = makeNode();
        childMap.set(first, nextMapEntry);
        if (isObjectKey(first)) mapEntry.hasWeakEntries = true;
      }

      this.#set(nextMapEntry, rest, value);
    }
  }

  set(key, value) {
    if (!Array.isArray(key)) {
      throw new TypeError('Expected key to be an array');
    }

    if (key.length === 0) {
      throw new TypeError('Keys must be at least length 1');
    }

    this.#set(this.#internalMap, key, value);
  }

  #get(mapEntry, key) {
    if (key.length === 1) {
      return this.#layerFor(mapEntry, key[0]).get(key[0]);
    } else {
      const [first, ...rest] = key;
      const nextMapEntry = this.#childrenFor(mapEntry, first).get(first);

      if (!nextMapEntry) {
        return undefined;
      }

      return this.#get(nextMapEntry, rest);
    }
  }

  get(key) {
    if (!Array.isArray(key)) {
      throw new TypeError('Expected key to be an array');
    }

    if (key.length === 0) {
      return undefined;
    }

    return this.#get(this.#internalMap, key);
  }

  #has(mapEntry, key) {
    if (key.length === 1) {
      return this.#layerFor(mapEntry, key[0]).has(key[0]);
    } else {
      const [first, ...rest] = key;
      const nextMapEntry = this.#childrenFor(mapEntry, first).get(first);

      if (!nextMapEntry) {
        return false;
      }

      return this.#has(nextMapEntry, rest);
    }
  }

  has(key) {
    if (!Array.isArray(key)) {
      throw new TypeError('Expected key to be an array');
    }

    if (key.length === 0) {
      return false;
    }

    return this.#has(this.#internalMap, key);
  }

  *values() {
    for (const [, value] of this.entries()) {
      yield value;
    }
  }

  *keys() {
    for (const [key] of this.entries()) {
      yield key;
    }
  }

  *#entries(mapEntry, key) {
    for (const [layerKey, layerValue] of mapEntry.layer.entries()) {
      yield [[...key, layerKey], layerValue];
    }

    for (const [layerKey, layerMapEntry] of mapEntry.children.entries()) {
      yield* this.#entries(layerMapEntry, [...key, layerKey]);
    }
  }

  *entries() {
    yield* this.#entries(this.#internalMap, []);
  }

  #canPrune(node) {
    return (
      !node.hasWeakEntries &&
      node.layer.size === 0 &&
      node.children.size === 0
    );
  }

  #delete(mapEntry, key) {
    if (key.length === 1) {
      return this.#layerFor(mapEntry, key[0]).delete(key[0]);
    }

    const [first, ...rest] = key;
    const childMap = this.#childrenFor(mapEntry, first);
    const nextMapEntry = childMap.get(first);

    if (!nextMapEntry) {
      return false;
    }

    const deleted = this.#delete(nextMapEntry, rest);

    if (deleted && this.#canPrune(nextMapEntry)) {
      childMap.delete(first);
    }

    return deleted;
  }

  delete(key) {
    if (!Array.isArray(key) || key.length === 0) {
      return false;
    }

    return this.#delete(this.#internalMap, key);
  }

  #forEachInSubtree(mapEntry, onValue) {
    for (const value of mapEntry.layer.values()) {
      onValue(value);
    }

    for (const childEntry of mapEntry.children.values()) {
      this.#forEachInSubtree(childEntry, onValue);
    }
  }

  #deleteByPrefix(mapEntry, keyPrefix, onValue) {
    if (keyPrefix.length === 1) {
      const key = keyPrefix[0];
      const layer = this.#layerFor(mapEntry, key);
      const childMap = this.#childrenFor(mapEntry, key);
      let deleted = false;

      if (layer.has(key)) {
        if (onValue) onValue(layer.get(key));
        layer.delete(key);
        deleted = true;
      }

      const childEntry = childMap.get(key);

      if (childEntry) {
        if (onValue) this.#forEachInSubtree(childEntry, onValue);
        childMap.delete(key);
        deleted = true;
      }

      return deleted;
    }

    const [first, ...rest] = keyPrefix;
    const childMap = this.#childrenFor(mapEntry, first);
    const nextMapEntry = childMap.get(first);

    if (!nextMapEntry) {
      return false;
    }

    const deleted = this.#deleteByPrefix(nextMapEntry, rest, onValue);

    if (deleted && this.#canPrune(nextMapEntry)) {
      childMap.delete(first);
    }

    return deleted;
  }

  deleteByPrefix(keyPrefix, onValue) {
    if (!Array.isArray(keyPrefix) || keyPrefix.length === 0) {
      return false;
    }

    return this.#deleteByPrefix(this.#internalMap, keyPrefix, onValue);
  }

  clear() {
    this.#internalMap = makeNode();
  }
}
