import { LruCompositeMap } from './lru-composite-map';

describe('LruCompositeMap', () => {
  describe('given a default LRU with maxSize=3', () => {
    let lru: LruCompositeMap<unknown[], unknown>;

    beforeEach(() => {
      lru = new LruCompositeMap(3);
    });

    describe('when getting a missing key', () => {
      it('returns undefined', () => {
        expect(lru.get(['missing'])).toBe(undefined);
      });
    });

    describe('when calling has for a missing key', () => {
      it('returns false', () => {
        expect(lru.has(['missing'])).toBe(false);
      });
    });

    describe('given a value is set', () => {
      beforeEach(() => {
        lru.set(['a'], 'value-a');
      });

      describe('when getting the value', () => {
        it('returns it', () => {
          expect(lru.get(['a'])).toBe('value-a');
        });
      });

      describe('when calling has', () => {
        it('returns true', () => {
          expect(lru.has(['a'])).toBe(true);
        });
      });

      describe('when setting the same key again', () => {
        beforeEach(() => {
          lru.set(['a'], 'new');
        });

        it('get returns the new value', () => {
          expect(lru.get(['a'])).toBe('new');
        });
      });
    });

    describe('given a value is set with a multi-level composite key', () => {
      beforeEach(() => {
        lru.set([1, 2, 3], 'deep');
      });

      it('when getting the value, returns it', () => {
        expect(lru.get([1, 2, 3])).toBe('deep');
      });
    });

    describe('given a value is set with an object reference key', () => {
      let ref: object;

      beforeEach(() => {
        ref = {};
        lru.set([ref, 'a'], 'value');
      });

      it('when getting the value, returns it', () => {
        expect(lru.get([ref, 'a'])).toBe('value');
      });
    });
  });

  describe('given an LRU with maxSize=2 and three entries set', () => {
    let lru: LruCompositeMap<unknown[], unknown>;

    beforeEach(() => {
      lru = new LruCompositeMap(2);
      lru.set(['a'], 'value-a');
      lru.set(['b'], 'value-b');
      lru.set(['c'], 'value-c');
    });

    it('when getting the first entry, returns undefined because it was evicted', () => {
      expect(lru.get(['a'])).toBe(undefined);
    });

    it('when getting the second entry, returns its value', () => {
      expect(lru.get(['b'])).toBe('value-b');
    });

    it('when getting the third entry, returns its value', () => {
      expect(lru.get(['c'])).toBe('value-c');
    });
  });

  describe('given an LRU with maxSize=1 and two entries set', () => {
    let lru: LruCompositeMap<unknown[], unknown>;

    beforeEach(() => {
      lru = new LruCompositeMap(1);
      lru.set(['a'], 'value-a');
      lru.set(['b'], 'value-b');
    });

    it('when getting the first entry, returns undefined because it was evicted', () => {
      expect(lru.get(['a'])).toBe(undefined);
    });

    it('when getting the second entry, returns its value', () => {
      expect(lru.get(['b'])).toBe('value-b');
    });
  });

  describe('given an LRU with maxSize=2 and three composite-key entries set', () => {
    let lru: LruCompositeMap<unknown[], unknown>;

    beforeEach(() => {
      lru = new LruCompositeMap(2);
      lru.set([1, 2], 'first');
      lru.set([3, 4], 'second');
      lru.set([5, 6], 'third');
    });

    it('when getting the first entry, returns undefined because it was evicted', () => {
      expect(lru.get([1, 2])).toBe(undefined);
    });

    it('when getting the second entry, returns its value', () => {
      expect(lru.get([3, 4])).toBe('second');
    });

    it('when getting the third entry, returns its value', () => {
      expect(lru.get([5, 6])).toBe('third');
    });
  });

  describe('given an LRU with maxSize=2 and three object-reference-key entries set', () => {
    let lru: LruCompositeMap<unknown[], unknown>;
    let ref1: object;
    let ref2: object;
    let ref3: object;

    beforeEach(() => {
      lru = new LruCompositeMap(2);
      ref1 = {};
      ref2 = {};
      ref3 = {};
      lru.set([ref1], 'first');
      lru.set([ref2], 'second');
      lru.set([ref3], 'third');
    });

    it('when getting the first entry, returns undefined because it was evicted', () => {
      expect(lru.get([ref1])).toBe(undefined);
    });

    it('when getting the second entry, returns its value', () => {
      expect(lru.get([ref2])).toBe('second');
    });

    it('when getting the third entry, returns its value', () => {
      expect(lru.get([ref3])).toBe('third');
    });
  });

  describe('given an LRU with maxSize=2 and two entries', () => {
    let lru: LruCompositeMap<unknown[], unknown>;

    beforeEach(() => {
      lru = new LruCompositeMap(2);
      lru.set(['a'], 'value-a');
      lru.set(['b'], 'value-b');
    });

    describe('when getting the first entry and then adding a third', () => {
      beforeEach(() => {
        lru.get(['a']);
        lru.set(['c'], 'value-c');
      });

      it('the first entry is still cached because get promoted it', () => {
        expect(lru.get(['a'])).toBe('value-a');
      });

      it('the second entry is evicted', () => {
        expect(lru.get(['b'])).toBe(undefined);
      });

      it('the third entry is available', () => {
        expect(lru.get(['c'])).toBe('value-c');
      });
    });

    describe('when updating the first entry and then adding a third', () => {
      beforeEach(() => {
        lru.set(['a'], 'updated-a');
        lru.set(['c'], 'value-c');
      });

      it('the first entry is still cached with its updated value because set promoted it', () => {
        expect(lru.get(['a'])).toBe('updated-a');
      });

      it('the second entry is evicted', () => {
        expect(lru.get(['b'])).toBe(undefined);
      });

      it('the third entry is available', () => {
        expect(lru.get(['c'])).toBe('value-c');
      });
    });

    describe('when calling has on the first entry and then adding a third', () => {
      beforeEach(() => {
        lru.has(['a']);
        lru.set(['c'], 'value-c');
      });

      it('the first entry is evicted because has does not promote', () => {
        expect(lru.get(['a'])).toBe(undefined);
      });

      it('the second entry is still cached', () => {
        expect(lru.get(['b'])).toBe('value-b');
      });

      it('the third entry is available', () => {
        expect(lru.get(['c'])).toBe('value-c');
      });
    });

    describe('when updating the first entry without adding a new entry', () => {
      beforeEach(() => {
        lru.set(['a'], 'updated-a');
      });

      it('the first entry has the updated value', () => {
        expect(lru.get(['a'])).toBe('updated-a');
      });

      it('the second entry is still cached because size did not change', () => {
        expect(lru.get(['b'])).toBe('value-b');
      });
    });
  });

  describe('given an LRU with maxSize=5 and two entries set', () => {
    let lru: LruCompositeMap<unknown[], unknown>;

    beforeEach(() => {
      lru = new LruCompositeMap(5);
      lru.set(['a'], 'value-a');
      lru.set([1, 2], 'value-12');
    });

    describe('when iterating values', () => {
      it('yields unwrapped values', () => {
        expect([...lru.values()]).toEqual(['value-a', 'value-12']);
      });
    });

    describe('when iterating keys', () => {
      it('yields the keys', () => {
        expect([...lru.keys()]).toEqual([['a'], [1, 2]]);
      });
    });

    describe('when iterating entries', () => {
      it('yields key-value pairs', () => {
        expect([...lru.entries()]).toEqual([
          [['a'], 'value-a'],
          [[1, 2], 'value-12'],
        ]);
      });
    });
  });

  describe('given an LRU with maxSize=2, three entries set, causing eviction', () => {
    let lru: LruCompositeMap<unknown[], unknown>;

    beforeEach(() => {
      lru = new LruCompositeMap(2);
      lru.set(['a'], 1);
      lru.set(['b'], 2);
      lru.set(['c'], 3);
    });

    describe('when iterating values', () => {
      it('returns only surviving entries', () => {
        expect([...lru.values()]).toEqual([2, 3]);
      });
    });
  });

  describe('given an LRU with maxSize=5 and two entries', () => {
    let lru: LruCompositeMap<unknown[], unknown>;

    beforeEach(() => {
      lru = new LruCompositeMap(5);
      lru.set(['a'], 'value-a');
      lru.set(['b'], 'value-b');
    });

    describe('when clearing', () => {
      beforeEach(() => {
        lru.clear();
      });

      it('the first entry is removed', () => {
        expect(lru.get(['a'])).toBe(undefined);
      });

      it('the second entry is removed', () => {
        expect(lru.get(['b'])).toBe(undefined);
      });

      it('values iteration yields nothing', () => {
        expect([...lru.values()]).toEqual([]);
      });
    });
  });

  describe('given an LRU with maxSize=2, two entries, then cleared', () => {
    let lru: LruCompositeMap<unknown[], unknown>;

    beforeEach(() => {
      lru = new LruCompositeMap(2);
      lru.set(['a'], 1);
      lru.set(['b'], 2);
      lru.clear();
      lru.set(['c'], 3);
      lru.set(['d'], 4);
    });

    it('when getting the third entry, returns its value because size was reset', () => {
      expect(lru.get(['c'])).toBe(3);
    });

    it('when getting the fourth entry, returns its value because size was reset', () => {
      expect(lru.get(['d'])).toBe(4);
    });
  });

  describe('given an LRU with maxSize=3, three entries, and first entry promoted via get', () => {
    let lru: LruCompositeMap<unknown[], unknown>;

    beforeEach(() => {
      lru = new LruCompositeMap(3);
      lru.set(['a'], 1);
      lru.set(['b'], 2);
      lru.set(['c'], 3);
      lru.get(['a']);
      lru.set(['d'], 4);
    });

    it('when getting the first entry, returns its value because it was promoted', () => {
      expect(lru.get(['a'])).toBe(1);
    });

    it('when getting the second entry, returns undefined because it was evicted as LRU', () => {
      expect(lru.get(['b'])).toBe(undefined);
    });

    it('when getting the third entry, returns its value', () => {
      expect(lru.get(['c'])).toBe(3);
    });

    it('when getting the fourth entry, returns its value', () => {
      expect(lru.get(['d'])).toBe(4);
    });
  });

  describe('given an LRU with maxSize=5 and entries with shared prefix', () => {
    let lru: LruCompositeMap<unknown[], unknown>;

    beforeEach(() => {
      lru = new LruCompositeMap(5);
      lru.set(['a', 'b'], 'ab');
      lru.set(['a', 'c'], 'ac');
      lru.set(['x'], 'x');
    });

    describe('when deleting by prefix matching the shared prefix', () => {
      beforeEach(() => {
        lru.deleteByPrefix(['a']);
      });

      it('the first matching entry is removed', () => {
        expect(lru.has(['a', 'b'])).toBe(false);
      });

      it('the second matching entry is removed', () => {
        expect(lru.has(['a', 'c'])).toBe(false);
      });

      it('the non-matching entry is still available', () => {
        expect(lru.get(['x'])).toBe('x');
      });
    });
  });

  describe('given an LRU with maxSize=3 and three entries', () => {
    let lru: LruCompositeMap<unknown[], unknown>;

    beforeEach(() => {
      lru = new LruCompositeMap(3);
      lru.set(['a'], 1);
      lru.set(['b'], 2);
      lru.set(['c'], 3);
    });

    describe('when deleting one entry by prefix and adding a new one', () => {
      beforeEach(() => {
        lru.deleteByPrefix(['a']);
        lru.set(['d'], 4);
      });

      it('the second entry is still cached because no eviction was needed', () => {
        expect(lru.get(['b'])).toBe(2);
      });

      it('the third entry is still cached', () => {
        expect(lru.get(['c'])).toBe(3);
      });

      it('the new entry is available', () => {
        expect(lru.get(['d'])).toBe(4);
      });
    });
  });

  describe('given an LRU with maxSize=2 and two entries', () => {
    let lru: LruCompositeMap<unknown[], unknown>;

    beforeEach(() => {
      lru = new LruCompositeMap(2);
      lru.set(['a'], 1);
      lru.set(['b'], 2);
    });

    describe('when deleting first entry by prefix, then adding two more entries', () => {
      beforeEach(() => {
        lru.deleteByPrefix(['a']);
        lru.set(['c'], 3);
        lru.set(['d'], 4);
      });

      it('the second entry is evicted because it became LRU', () => {
        expect(lru.get(['b'])).toBe(undefined);
      });

      it('the third entry is available', () => {
        expect(lru.get(['c'])).toBe(3);
      });

      it('the fourth entry is available', () => {
        expect(lru.get(['d'])).toBe(4);
      });
    });
  });

  describe('given an LRU with maxSize=5 and one entry', () => {
    let lru: LruCompositeMap<unknown[], unknown>;

    beforeEach(() => {
      lru = new LruCompositeMap(5);
      lru.set(['a'], 1);
    });

    describe('when deleting by a non-matching prefix', () => {
      it('returns false', () => {
        expect(lru.deleteByPrefix(['z'])).toBe(false);
      });

      it('the existing entry is still available', () => {
        lru.deleteByPrefix(['z']);
        expect(lru.get(['a'])).toBe(1);
      });
    });
  });
});
