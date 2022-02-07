import getCycles from './getCycles';

describe('getCycles', () => {
  it('given small cycle, returns cycles', () => {
    const oneToManyMap = new Map([
      ['a', new Set(['b'])],
      ['b', new Set(['a'])],
    ]);

    const actual = getCycles(oneToManyMap);

    expect(actual).toEqual([
      ['a', 'b', 'a'],
      ['b', 'a', 'b'],
    ]);
  });

  it('given nested cycle, returns cycles', () => {
    const oneToManyMap = new Map([
      ['a', new Set(['b'])],
      ['b', new Set(['c'])],
      ['c', new Set(['a'])],
    ]);

    const actual = getCycles(oneToManyMap);

    expect(actual).toEqual([
      ['a', 'b', 'c', 'a'],
      ['b', 'c', 'a', 'b'],
      ['c', 'a', 'b', 'c'],
    ]);
  });

  it('given nested nested cycle, returns cycles', () => {
    const oneToManyMap = new Map([
      ['x', new Set(['a'])],
      ['a', new Set(['b'])],
      ['b', new Set(['c'])],
      ['c', new Set(['a'])],
    ]);

    const actual = getCycles(oneToManyMap);

    expect(actual).toEqual([
      ['x', 'a', 'b', 'c', 'a'],
      ['a', 'b', 'c', 'a'],
      ['b', 'c', 'a', 'b'],
      ['c', 'a', 'b', 'c'],
    ]);
  });

  it('given no cycle, returns no cycles', () => {
    const oneToManyMap = new Map([
      ['a', new Set(['b'])],
      ['b', new Set([])],
    ]);

    const actual = getCycles(oneToManyMap);

    expect(actual).toEqual([]);
  });
});
