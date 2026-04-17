import { CompositeMap } from './composite-map';

export class LruCompositeMap {
  #inner = new CompositeMap();
  #maxSize;
  #size = 0;
  #head = null;
  #tail = null;

  constructor(maxSize) {
    this.#maxSize = maxSize;
  }

  #addToHead(node) {
    node.next = this.#head;
    node.prev = null;

    if (this.#head) {
      this.#head.prev = node;
    }

    this.#head = node;

    if (!this.#tail) {
      this.#tail = node;
    }
  }

  #removeNode(node) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.#head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.#tail = node.prev;
    }

    node.prev = null;
    node.next = null;
  }

  #promoteNode(node) {
    if (node === this.#head) return;
    this.#removeNode(node);
    this.#addToHead(node);
  }

  #evictLru() {
    const lruNode = this.#tail;
    this.#removeNode(lruNode);
    this.#inner.delete(lruNode.key);
    this.#size--;
  }

  get(key) {
    const wrapper = this.#inner.get(key);

    if (wrapper === undefined) {
      return undefined;
    }

    this.#promoteNode(wrapper.lruNode);

    return wrapper.value;
  }

  set(key, value) {
    const existing = this.#inner.get(key);

    if (existing) {
      existing.value = value;
      this.#promoteNode(existing.lruNode);
      return;
    }

    const lruNode = { key, prev: null, next: null };
    this.#inner.set(key, { value, lruNode });
    this.#addToHead(lruNode);
    this.#size++;

    if (this.#size > this.#maxSize) {
      this.#evictLru();
    }
  }

  has(key) {
    return this.#inner.has(key);
  }

  *values() {
    for (const wrapper of this.#inner.values()) {
      yield wrapper.value;
    }
  }

  *keys() {
    yield* this.#inner.keys();
  }

  *entries() {
    for (const [key, wrapper] of this.#inner.entries()) {
      yield [key, wrapper.value];
    }
  }

  deleteByPrefix(keyPrefix) {
    return this.#inner.deleteByPrefix(keyPrefix, wrapper => {
      this.#removeNode(wrapper.lruNode);
      this.#size--;
    });
  }

  clear() {
    this.#inner.clear();
    this.#head = null;
    this.#tail = null;
    this.#size = 0;
  }
}
