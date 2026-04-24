import { CompositeMap } from './composite-map';

describe('compositeMap', () => {
  describe('given no initial values, when a CompositeMap is created', () => {
    let compositeMap;

    beforeEach(() => {
      compositeMap = new CompositeMap();
    });

    it('throws when calling set with a key that is not an array', () => {
      expect(() => compositeMap.set('not an array', 1)).toThrowError(
        'Expected key to be an array',
      );
    });

    it('throws when calling has with a key that is not an array', () => {
      expect(() => compositeMap.has('not an array')).toThrowError(
        'Expected key to be an array',
      );
    });

    it('throws when calling get with a key that is not an array', () => {
      expect(() => compositeMap.get('not an array')).toThrowError(
        'Expected key to be an array',
      );
    });

    it('throws when calling set with a key that is an empty array', () => {
      expect(() => compositeMap.set([], 1)).toThrowError(
        'Keys must be at least length 1',
      );
    });

    it('returns false when has is called with an empty array', () => {
      expect(compositeMap.has([])).toBe(false);
    });

    it('returns undefined when get is called with an empty array', () => {
      expect(compositeMap.get([])).toBe(undefined);
    });

    describe('when a value is set with primitive composed keys, ', () => {
      beforeEach(() => {
        compositeMap.set([1, 2, 3], 'some-value');
      });

      it('when getting the value with same keys, returns the value', () => {
        const actual = compositeMap.get([1, 2, 3]);

        expect(actual).toBe('some-value');
      });

      it('when checking if the value exists using the same keys, returns true', () => {
        const actual = compositeMap.has([1, 2, 3]);

        expect(actual).toBe(true);
      });

      it('when checking if a non existing value exists, returns false', () => {
        const actual = compositeMap.has([1, 'not-2', 3]);

        expect(actual).toBe(false);
      });

      it('when getting a missing value, returns undefined', () => {
        const actual = compositeMap.get([1, 'irrelevant', 3]);

        expect(actual).toBe(undefined);
      });

      it('when getting a value using the prefix of a previously set key, returns undefined', () => {
        const actual = compositeMap.get([1, 2]);

        expect(actual).toBe(undefined);
      });

      it('when checking if the value exists using the prefix of a previously set key, returns false', () => {
        const actual = compositeMap.has([1, 2]);

        expect(actual).toBe(false);
      });
    });

    it('when a value is set with non-primitive composed keys, when getting the value with same keys, returns the value', () => {
      const someNonPrimitiveKey = {};

      compositeMap.set([1, someNonPrimitiveKey, 3], 'some-value');

      const actual = compositeMap.get([1, someNonPrimitiveKey, 3]);

      expect(actual).toBe('some-value');
    });

    it('when a value is set with non-primitive composed keys, when getting the value with keys of different reference equality, returns undefined', () => {
      const someNonPrimitiveKey1 = {};
      const someNonPrimitiveKey2 = {};

      compositeMap.set([1, someNonPrimitiveKey1, 3], 'some-value');

      const actual = compositeMap.get([1, someNonPrimitiveKey2, 3]);

      expect(actual).toBe(undefined);
    });

    it('when no value is set, when getting a value, returns undefined', () => {
      const actual = compositeMap.get([1, 2, 3]);

      expect(actual).toBe(undefined);
    });

    describe('weak-holding of object-typed key parts', () => {
      it('when a value is set with an object leaf key, getting with the same reference returns the value', () => {
        const ref = {};

        compositeMap.set([ref], 'some-value');

        expect(compositeMap.get([ref])).toBe('some-value');
      });

      it('when a value is set with an object leaf key, getting with a different reference returns undefined', () => {
        compositeMap.set([{}], 'some-value');

        expect(compositeMap.get([{}])).toBe(undefined);
      });

      it('when a value is set with a function leaf key, getting with the same reference returns the value', () => {
        const fn = () => {};

        compositeMap.set([fn], 'some-value');

        expect(compositeMap.get([fn])).toBe('some-value');
      });

      it('when a value is set with a mixed composite key (object first), getting with the same references returns the value', () => {
        const ref = {};

        compositeMap.set([ref, 'primitive'], 'some-value');

        expect(compositeMap.get([ref, 'primitive'])).toBe('some-value');
      });

      it('when a value is set with a mixed composite key (object last), getting with the same references returns the value', () => {
        const ref = {};

        compositeMap.set(['primitive', ref], 'some-value');

        expect(compositeMap.get(['primitive', ref])).toBe('some-value');
      });

      it('when values are set under object keys, iteration does not yield them', () => {
        const ref = {};

        compositeMap.set([ref], 'weakly-held');
        compositeMap.set(['primitive'], 'strongly-held');

        expect([...compositeMap.values()]).toEqual(['strongly-held']);
      });

      it('when values are set under object keys, iteration does not yield entries below weak children', () => {
        const ref = {};

        compositeMap.set([ref, 'x'], 'weakly-held');
        compositeMap.set(['primitive'], 'strongly-held');

        expect([...compositeMap.values()]).toEqual(['strongly-held']);
      });

      it('when clearing, object-keyed entries are no longer retrievable', () => {
        const ref = {};
        compositeMap.set([ref], 'some-value');

        compositeMap.clear();

        expect(compositeMap.get([ref])).toBe(undefined);
      });

      it('when deleting an object-keyed entry, get returns undefined', () => {
        const ref = {};
        compositeMap.set([ref], 'some-value');

        compositeMap.delete([ref]);

        expect(compositeMap.get([ref])).toBe(undefined);
      });

      it('when deleting one of several entries sharing an object prefix, the siblings survive', () => {
        const ref = {};
        compositeMap.set([ref, 'a'], 'a-val');
        compositeMap.set([ref, 'b'], 'b-val');

        compositeMap.delete([ref, 'a']);

        expect(compositeMap.get([ref, 'b'])).toBe('b-val');
      });
    });
  });

  describe('given initial values, when a CompositeMap is created', () => {
    let compositeMap;

    beforeEach(() => {
      compositeMap = new CompositeMap([
        [['some-root-key'], 'some-root-value'],
        [[1, 2, 3], 'some-deep-value'],
      ]);
    });

    it('when iterating values, yields all values', () => {
      const actual = [...compositeMap.values()];

      expect(actual).toEqual(['some-root-value', 'some-deep-value']);
    });

    it('when iterating keys, yields all keys', () => {
      const actual = [...compositeMap.keys()];

      expect(actual).toEqual([['some-root-key'], [1, 2, 3]]);
    });

    it('when iterating entries, yields all entries', () => {
      const actual = [...compositeMap.entries()];

      expect(actual).toEqual([
        [['some-root-key'], 'some-root-value'],
        [[1, 2, 3], 'some-deep-value'],
      ]);
    });

    it('when getting a value with one of the initial keys, returns the value', () => {
      const actual = compositeMap.get([1, 2, 3]);

      expect(actual).toBe('some-deep-value');
    });

    describe('when clearing', () => {
      beforeEach(() => {
        compositeMap.clear();
      });

      it('when iterating values, returns nothing', () => {
        const actual = [...compositeMap.values()];

        expect(actual).toEqual([]);
      });

      it('when iterating keys, returns nothing', () => {
        const actual = [...compositeMap.keys()];

        expect(actual).toEqual([]);
      });

      it('when iterating entries, returns nothing', () => {
        const actual = [...compositeMap.entries()];

        expect(actual).toEqual([]);
      });

      it('when getting a value with one of the initial keys, returns undefined', () => {
        const actual = compositeMap.get([1, 2, 3]);

        expect(actual).toBe(undefined);
      });
    });
  });

  describe('delete', () => {
    let compositeMap;

    beforeEach(() => {
      compositeMap = new CompositeMap();
    });

    it('when deleting with a non-array key, returns false', () => {
      expect(compositeMap.delete('not an array')).toBe(false);
    });

    it('when deleting with an empty array key, returns false', () => {
      expect(compositeMap.delete([])).toBe(false);
    });

    it('when deleting a key that does not exist, returns false', () => {
      expect(compositeMap.delete([1, 2, 3])).toBe(false);
    });

    describe('given a single-level key exists', () => {
      beforeEach(() => {
        compositeMap.set(['a'], 'value');
      });

      describe('when deleting the key', () => {
        let result;

        beforeEach(() => {
          result = compositeMap.delete(['a']);
        });

        it('returns true', () => {
          expect(result).toBe(true);
        });

        it('get returns undefined', () => {
          expect(compositeMap.get(['a'])).toBe(undefined);
        });

        it('has returns false', () => {
          expect(compositeMap.has(['a'])).toBe(false);
        });
      });
    });

    describe('given a multi-level key exists', () => {
      beforeEach(() => {
        compositeMap.set([1, 2, 3], 'value');
      });

      describe('when deleting the key', () => {
        let result;

        beforeEach(() => {
          result = compositeMap.delete([1, 2, 3]);
        });

        it('returns true', () => {
          expect(result).toBe(true);
        });

        it('get returns undefined', () => {
          expect(compositeMap.get([1, 2, 3])).toBe(undefined);
        });

        it('has returns false', () => {
          expect(compositeMap.has([1, 2, 3])).toBe(false);
        });
      });
    });

    describe('given two entries sharing a prefix', () => {
      beforeEach(() => {
        compositeMap.set([1, 2, 3], 'first');
        compositeMap.set([1, 2, 4], 'second');
      });

      it('when deleting one, the other is not affected', () => {
        compositeMap.delete([1, 2, 3]);

        expect(compositeMap.get([1, 2, 4])).toBe('second');
      });
    });

    describe('given an entry is set and then deleted', () => {
      beforeEach(() => {
        compositeMap.set([1, 2, 3], 'value');
        compositeMap.delete([1, 2, 3]);
      });

      it('when re-adding at the same key, returns the new value', () => {
        compositeMap.set([1, 2, 3], 'new-value');

        expect(compositeMap.get([1, 2, 3])).toBe('new-value');
      });
    });

    describe('given a deep entry and a sibling branch', () => {
      beforeEach(() => {
        compositeMap.set([1, 2, 3], 'deep');
        compositeMap.set([1, 'other'], 'sibling');
      });

      it('when deleting the deep entry, the sibling branch is preserved', () => {
        compositeMap.delete([1, 2, 3]);

        expect(compositeMap.get([1, 'other'])).toBe('sibling');
      });
    });

    describe('given an entry with object reference keys', () => {
      let ref;

      beforeEach(() => {
        ref = {};
        compositeMap.set([ref, 'a'], 'value');
      });

      describe('when deleting the entry', () => {
        let result;

        beforeEach(() => {
          result = compositeMap.delete([ref, 'a']);
        });

        it('returns true', () => {
          expect(result).toBe(true);
        });

        it('has returns false', () => {
          expect(compositeMap.has([ref, 'a'])).toBe(false);
        });
      });
    });
  });

  describe('deleteByPrefix', () => {
    let compositeMap;

    beforeEach(() => {
      compositeMap = new CompositeMap();
    });

    it('when deleting by a non-array prefix, returns false', () => {
      expect(compositeMap.deleteByPrefix('not an array')).toBe(false);
    });

    it('when deleting by an empty array prefix, returns false', () => {
      expect(compositeMap.deleteByPrefix([])).toBe(false);
    });

    describe('given an entry exists', () => {
      beforeEach(() => {
        compositeMap.set([1, 2], 'value');
      });

      it('when deleting by a prefix that does not match, returns false', () => {
        expect(compositeMap.deleteByPrefix([3])).toBe(false);
      });
    });

    describe('given a single-level entry exists', () => {
      beforeEach(() => {
        compositeMap.set(['a'], 'value-a');
      });

      describe('when deleting by exact prefix', () => {
        let result;

        beforeEach(() => {
          result = compositeMap.deleteByPrefix(['a']);
        });

        it('returns true', () => {
          expect(result).toBe(true);
        });

        it('has returns false', () => {
          expect(compositeMap.has(['a'])).toBe(false);
        });
      });
    });

    describe('given multiple entries under a prefix and one outside', () => {
      beforeEach(() => {
        compositeMap.set(['a', 'b'], 'ab');
        compositeMap.set(['a', 'c'], 'ac');
        compositeMap.set(['a', 'b', 'd'], 'abd');
        compositeMap.set(['x'], 'x');
      });

      describe('when deleting by the shared prefix', () => {
        let result;

        beforeEach(() => {
          result = compositeMap.deleteByPrefix(['a']);
        });

        it('returns true', () => {
          expect(result).toBe(true);
        });

        it('has returns false for the first matching entry', () => {
          expect(compositeMap.has(['a', 'b'])).toBe(false);
        });

        it('has returns false for the second matching entry', () => {
          expect(compositeMap.has(['a', 'c'])).toBe(false);
        });

        it('has returns false for the deeper matching entry', () => {
          expect(compositeMap.has(['a', 'b', 'd'])).toBe(false);
        });

        it('does not affect the entry outside the prefix', () => {
          expect(compositeMap.get(['x'])).toBe('x');
        });
      });
    });

    describe('given an exact entry and a deeper entry at the same prefix', () => {
      beforeEach(() => {
        compositeMap.set(['a'], 'exact');
        compositeMap.set(['a', 'b'], 'deeper');
      });

      describe('when deleting by the prefix', () => {
        let result;

        beforeEach(() => {
          result = compositeMap.deleteByPrefix(['a']);
        });

        it('returns true', () => {
          expect(result).toBe(true);
        });

        it('has returns false for the exact entry', () => {
          expect(compositeMap.has(['a'])).toBe(false);
        });

        it('has returns false for the deeper entry', () => {
          expect(compositeMap.has(['a', 'b'])).toBe(false);
        });
      });
    });

    describe('given entries under a multi-level prefix and an entry under a sibling', () => {
      beforeEach(() => {
        compositeMap.set(['a', 'b', 'c'], 'abc');
        compositeMap.set(['a', 'b', 'd'], 'abd');
        compositeMap.set(['a', 'x'], 'ax');
      });

      describe('when deleting by the multi-level prefix', () => {
        let result;

        beforeEach(() => {
          result = compositeMap.deleteByPrefix(['a', 'b']);
        });

        it('returns true', () => {
          expect(result).toBe(true);
        });

        it('has returns false for the first matching entry', () => {
          expect(compositeMap.has(['a', 'b', 'c'])).toBe(false);
        });

        it('has returns false for the second matching entry', () => {
          expect(compositeMap.has(['a', 'b', 'd'])).toBe(false);
        });

        it('does not affect the sibling entry', () => {
          expect(compositeMap.get(['a', 'x'])).toBe('ax');
        });
      });
    });

    describe('given two entries under a prefix', () => {
      beforeEach(() => {
        compositeMap.set(['a', 'b'], 'ab');
        compositeMap.set(['a', 'c'], 'ac');
      });

      describe('when deleting by prefix with an onValue callback', () => {
        let deleted;

        beforeEach(() => {
          deleted = [];
          compositeMap.deleteByPrefix(['a'], value => deleted.push(value));
        });

        it('calls onValue with all deleted values', () => {
          expect(deleted).toEqual(expect.arrayContaining(['ab', 'ac']));
        });

        it('calls onValue exactly once per deleted entry', () => {
          expect(deleted).toHaveLength(2);
        });
      });
    });

    describe('given an entry is deleted by prefix', () => {
      beforeEach(() => {
        compositeMap.set(['a', 'b', 'c'], 'value');
        compositeMap.deleteByPrefix(['a', 'b']);
      });

      it('when re-adding at the same key, returns the new value', () => {
        compositeMap.set(['a', 'b', 'c'], 'new-value');

        expect(compositeMap.get(['a', 'b', 'c'])).toBe('new-value');
      });
    });

    describe('given entries with object reference keys', () => {
      let ref;

      beforeEach(() => {
        ref = {};
        compositeMap.set([ref, 'a'], 'ra');
        compositeMap.set([ref, 'b'], 'rb');
      });

      describe('when deleting by the object reference prefix', () => {
        let result;

        beforeEach(() => {
          result = compositeMap.deleteByPrefix([ref]);
        });

        it('returns true', () => {
          expect(result).toBe(true);
        });

        it('has returns false for the first entry', () => {
          expect(compositeMap.has([ref, 'a'])).toBe(false);
        });

        it('has returns false for the second entry', () => {
          expect(compositeMap.has([ref, 'b'])).toBe(false);
        });
      });
    });
  });
});
