export class CompositeMap {
  #internalMap = { layer: new Map(), children: new Map() };

  constructor(initialValues = []) {
    for (const [key, value] of initialValues) {
      this.set(key, value);
    }
  }

  #set(mapEntry, key, value) {
    if (key.length === 1) {
      mapEntry.layer.set(key[0], value);
    } else {
      const [first, ...rest] = key;
      let nextMapEntry = mapEntry.children.get(first);

      if (!nextMapEntry) {
        nextMapEntry = { layer: new Map(), children: new Map() };
        mapEntry.children.set(first, nextMapEntry);
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
      return mapEntry.layer.get(key[0]);
    } else {
      const [first, ...rest] = key;
      const nextMapEntry = mapEntry.children.get(first);

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
      return mapEntry.layer.has(key[0]);
    } else {
      const [first, ...rest] = key;
      const nextMapEntry = mapEntry.children.get(first);

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

  clear() {
    this.#internalMap = { layer: new Map(), children: new Map() };
  }
}
