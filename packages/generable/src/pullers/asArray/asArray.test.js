import asArray from './asArray';

describe('asArray', () => {
  it('given sync iterable, returns array of values in iterable', () => {
    const syncIterable = (function* () {
      yield 1;
      yield 2;
      yield 3;
      return 4;
    })();

    const actual = asArray(syncIterable);

    expect(actual).toEqual([1, 2, 3]);
  });

  it('given async iterable, returns promise for array of values in iterable', async () => {
    const asyncIterable = (async function* () {
      yield 1;
      yield 2;
      yield 3;
      return 4;
    })();

    const actual = await asArray(asyncIterable);

    expect(actual).toEqual([1, 2, 3]);
  });
});
