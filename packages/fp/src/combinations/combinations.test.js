import combinations from './combinations';

describe('combinations', () => {
  it('given arrays of same size, returns all combinations', () => {
    const actual = combinations([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);

    const expected = [
      [1, 3, 5],
      [1, 3, 6],
      [1, 4, 5],
      [1, 4, 6],
      [2, 3, 5],
      [2, 3, 6],
      [2, 4, 5],
      [2, 4, 6],
    ];

    expect(actual).toEqual(expected);
  });

  it('given arrays of different size, returns all combinations', () => {
    const actual = combinations([
      [1, 2],
      [3, 4, 5],
    ]);

    const expected = [
      [1, 3],
      [1, 4],
      [1, 5],
      [2, 3],
      [2, 4],
      [2, 5],
    ];

    expect(actual).toEqual(expected);
  });

  it('given one of the arrays is empty, returns no combinations', () => {
    const actual = combinations([[1, 2], [], [3, 4, 5]]);

    const expected = [];

    expect(actual).toEqual(expected);
  });
});
