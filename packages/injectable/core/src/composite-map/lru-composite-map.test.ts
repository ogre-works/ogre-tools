import { LruCompositeMap } from './lru-composite-map';

describe('LruCompositeMap', () => {
  describe('basic operations', () => {
    let lru;

    beforeEach(() => {
      lru = new LruCompositeMap(3);
    });

    it('stores and retrieves a value', () => {
      lru.set(['a'], 'value-a');
      expect(lru.get(['a'])).toBe('value-a');
    });

    it('returns undefined for missing key', () => {
      expect(lru.get(['missing'])).toBe(undefined);
    });

    it('has() returns true for existing key', () => {
      lru.set(['a'], 'value-a');
      expect(lru.has(['a'])).toBe(true);
    });

    it('has() returns false for missing key', () => {
      expect(lru.has(['missing'])).toBe(false);
    });

    it('set() updates value for existing key', () => {
      lru.set(['a'], 'old');
      lru.set(['a'], 'new');
      expect(lru.get(['a'])).toBe('new');
    });

    it('works with multi-level composite keys', () => {
      lru.set([1, 2, 3], 'deep');
      expect(lru.get([1, 2, 3])).toBe('deep');
    });

    it('works with object reference keys', () => {
      const ref = {};
      lru.set([ref, 'a'], 'value');
      expect(lru.get([ref, 'a'])).toBe('value');
    });
  });

  describe('eviction', () => {
    it('evicts LRU entry when maxSize is exceeded', () => {
      const lru = new LruCompositeMap(2);

      lru.set(['a'], 'value-a');
      lru.set(['b'], 'value-b');
      lru.set(['c'], 'value-c'); // should evict 'a'

      expect(lru.get(['a'])).toBe(undefined);
      expect(lru.get(['b'])).toBe('value-b');
      expect(lru.get(['c'])).toBe('value-c');
    });

    it('maxSize=1 keeps only the most recent entry', () => {
      const lru = new LruCompositeMap(1);

      lru.set(['a'], 'value-a');
      lru.set(['b'], 'value-b');

      expect(lru.get(['a'])).toBe(undefined);
      expect(lru.get(['b'])).toBe('value-b');
    });

    it('evicts correct entry with composite keys', () => {
      const lru = new LruCompositeMap(2);

      lru.set([1, 2], 'first');
      lru.set([3, 4], 'second');
      lru.set([5, 6], 'third'); // should evict [1, 2]

      expect(lru.get([1, 2])).toBe(undefined);
      expect(lru.get([3, 4])).toBe('second');
      expect(lru.get([5, 6])).toBe('third');
    });

    it('evicts correct entry with object reference keys', () => {
      const lru = new LruCompositeMap(2);
      const ref1 = {};
      const ref2 = {};
      const ref3 = {};

      lru.set([ref1], 'first');
      lru.set([ref2], 'second');
      lru.set([ref3], 'third'); // should evict ref1

      expect(lru.get([ref1])).toBe(undefined);
      expect(lru.get([ref2])).toBe('second');
      expect(lru.get([ref3])).toBe('third');
    });
  });

  describe('LRU promotion', () => {
    it('get() promotes entry, making it not the LRU target', () => {
      const lru = new LruCompositeMap(2);

      lru.set(['a'], 'value-a');
      lru.set(['b'], 'value-b');

      // Access 'a' to promote it
      lru.get(['a']);

      // Now 'b' is LRU, should be evicted
      lru.set(['c'], 'value-c');

      expect(lru.get(['a'])).toBe('value-a');
      expect(lru.get(['b'])).toBe(undefined);
      expect(lru.get(['c'])).toBe('value-c');
    });

    it('set() on existing key promotes it', () => {
      const lru = new LruCompositeMap(2);

      lru.set(['a'], 'value-a');
      lru.set(['b'], 'value-b');

      // Update 'a' to promote it
      lru.set(['a'], 'updated-a');

      // Now 'b' is LRU
      lru.set(['c'], 'value-c');

      expect(lru.get(['a'])).toBe('updated-a');
      expect(lru.get(['b'])).toBe(undefined);
      expect(lru.get(['c'])).toBe('value-c');
    });

    it('has() does NOT promote entry', () => {
      const lru = new LruCompositeMap(2);

      lru.set(['a'], 'value-a');
      lru.set(['b'], 'value-b');

      // has() should NOT promote 'a'
      lru.has(['a']);

      // 'a' is still LRU, should be evicted
      lru.set(['c'], 'value-c');

      expect(lru.get(['a'])).toBe(undefined);
      expect(lru.get(['b'])).toBe('value-b');
      expect(lru.get(['c'])).toBe('value-c');
    });

    it('updating existing key does not change size', () => {
      const lru = new LruCompositeMap(2);

      lru.set(['a'], 'v1');
      lru.set(['b'], 'v2');
      lru.set(['a'], 'v1-updated'); // should not increase size

      // If size didn't change, both entries survive
      expect(lru.get(['a'])).toBe('v1-updated');
      expect(lru.get(['b'])).toBe('v2');
    });
  });

  describe('iterators', () => {
    let lru;

    beforeEach(() => {
      lru = new LruCompositeMap(5);
      lru.set(['a'], 'value-a');
      lru.set([1, 2], 'value-12');
    });

    it('values() yields unwrapped values', () => {
      const values = [...lru.values()];
      expect(values).toEqual(['value-a', 'value-12']);
    });

    it('keys() yields keys', () => {
      const keys = [...lru.keys()];
      expect(keys).toEqual([['a'], [1, 2]]);
    });

    it('entries() yields [key, unwrapped value] pairs', () => {
      const entries = [...lru.entries()];
      expect(entries).toEqual([
        [['a'], 'value-a'],
        [[1, 2], 'value-12'],
      ]);
    });

    it('values() returns only surviving entries after eviction', () => {
      const small = new LruCompositeMap(2);
      small.set(['a'], 1);
      small.set(['b'], 2);
      small.set(['c'], 3); // evicts 'a'

      const values = [...small.values()];
      expect(values).toEqual([2, 3]);
    });
  });

  describe('clear', () => {
    it('removes all entries', () => {
      const lru = new LruCompositeMap(5);
      lru.set(['a'], 'value-a');
      lru.set(['b'], 'value-b');

      lru.clear();

      expect(lru.get(['a'])).toBe(undefined);
      expect(lru.get(['b'])).toBe(undefined);
      expect([...lru.values()]).toEqual([]);
    });

    it('resets size so new entries can be added', () => {
      const lru = new LruCompositeMap(2);
      lru.set(['a'], 1);
      lru.set(['b'], 2);

      lru.clear();

      lru.set(['c'], 3);
      lru.set(['d'], 4);

      // Both should fit (size was reset)
      expect(lru.get(['c'])).toBe(3);
      expect(lru.get(['d'])).toBe(4);
    });
  });

  describe('maxSize=3 sequential eviction', () => {
    it('evicts entries in correct LRU order', () => {
      const lru = new LruCompositeMap(3);

      lru.set(['a'], 1);
      lru.set(['b'], 2);
      lru.set(['c'], 3);

      // Access 'a' and 'b' to promote them (order: b, a, c → LRU is c... wait)
      // Order after sets: head=c, then b, then a=tail
      // Access 'a': promotes a to head → head=a, c, b=tail
      lru.get(['a']);

      // Add 'd', should evict 'b' (the tail/LRU)
      lru.set(['d'], 4);

      expect(lru.get(['a'])).toBe(1);
      expect(lru.get(['b'])).toBe(undefined); // evicted
      expect(lru.get(['c'])).toBe(3);
      expect(lru.get(['d'])).toBe(4);
    });
  });
});
