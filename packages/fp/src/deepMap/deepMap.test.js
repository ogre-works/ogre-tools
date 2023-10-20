import { DeepMap } from './deepMap';

describe('deepMap', () => {
  describe('given no initial values, when a DeepMap is created', () => {
    let deepMap;

    beforeEach(() => {
      deepMap = new DeepMap();
    });

    describe('when a value is set with primitive composed keys, ', () => {
      beforeEach(() => {
        deepMap.set([1, 2, 3], 'some-value');
      });

      it('when getting the value with same keys, returns the value', () => {
        const actual = deepMap.get([1, 2, 3]);

        expect(actual).toBe('some-value');
      });

      it('when checking if the value exists using the same keys, returns true', () => {
        const actual = deepMap.has([1, 2, 3]);

        expect(actual).toBe(true);
      });

      it('when checking if a non existing value exists, returns false', () => {
        const actual = deepMap.has([1, 'not-2', 3]);

        expect(actual).toBe(false);
      });

      it('when getting a missing value, returns undefined', () => {
        const actual = deepMap.get([1, 'irrelevant', 3]);

        expect(actual).toBe(undefined);
      });

      it('when getting a value using only part of the key, returns the deepMap', () => {
        const actual = deepMap.get([1, 2]);

        expect(actual.get([3])).toBe('some-value');
      });

      it('when checking if the value exists using only part of the key, returns true', () => {
        const actual = deepMap.has([1, 2]);

        expect(actual).toBe(true);
      });
    });

    it('when a value is set with non-primitive composed keys, when getting the value with same keys, returns the value', () => {
      const someNonPrimitiveKey = {};

      deepMap.set([1, someNonPrimitiveKey, 3], 'some-value');

      const actual = deepMap.get([1, someNonPrimitiveKey, 3]);

      expect(actual).toBe('some-value');
    });

    it('when a value is set with non-primitive composed keys, when getting the value with keys of different reference equality, returns undefined', () => {
      const someNonPrimitiveKey1 = {};
      const someNonPrimitiveKey2 = {};

      deepMap.set([1, someNonPrimitiveKey1, 3], 'some-value');

      const actual = deepMap.get([1, someNonPrimitiveKey2, 3]);

      expect(actual).toBe(undefined);
    });

    it('when no value is set, when getting a value, returns undefined', () => {
      const actual = deepMap.get([1, 2, 3]);

      expect(actual).toBe(undefined);
    });
  });

  describe('given initial values, when a DeepMap is created', () => {
    let deepMap;

    beforeEach(() => {
      deepMap = new DeepMap([
        [['some-root-key'], 'some-root-value'],
        [[1, 2, 3], 'some-deep-value'],
      ]);
    });

    it('when iterating values, returns root DeepMaps and values', () => {
      const actual = [...deepMap.values()];

      expect(actual).toEqual(['some-root-value', expect.anything()]);
    });

    it('when iterating keys, returns root keys', () => {
      const actual = [...deepMap.keys()];

      expect(actual).toEqual(['some-root-key', 1]);
    });

    it('when iterating entries, returns root entries', () => {
      const actual = [...deepMap.entries()];

      expect(actual).toEqual([
        ['some-root-key', 'some-root-value'],
        [1, expect.anything()],
      ]);
    });

    it('when getting a value with one of the initial keys, returns the value', () => {
      const actual = deepMap.get([1, 2, 3]);

      expect(actual).toBe('some-deep-value');
    });

    describe('when clearing', () => {
      beforeEach(() => {
        deepMap.clear();
      });

      it('when iterating values, returns nothing', () => {
        const actual = [...deepMap.values()];

        expect(actual).toEqual([]);
      });

      it('when iterating keys, returns nothing', () => {
        const actual = [...deepMap.keys()];

        expect(actual).toEqual([]);
      });

      it('when iterating entries, returns nothing', () => {
        const actual = [...deepMap.entries()];

        expect(actual).toEqual([]);
      });

      it('when getting a value with one of the initial keys, returns undefined', () => {
        const actual = deepMap.get([1, 2, 3]);

        expect(actual).toBe(undefined);
      });
    });
  });
});
