import movingWindow from './movingWindow';

describe('movingWindow', () => {
  it('iterates an n-width window through an array', () => {
    const actual = movingWindow(3)([1, 2, 3, 4, 5]);

    expect(actual).toEqual([
      [1, 2, 3],
      [2, 3, 4],
      [3, 4, 5],
    ]);
  });
});
