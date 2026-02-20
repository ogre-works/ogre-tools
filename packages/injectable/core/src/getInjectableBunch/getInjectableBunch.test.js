import getInjectableBunch from './getInjectableBunch';
import isInjectableBunch from './isInjectableBunch';

describe('getInjectableBunch', () => {
  it('works with objects', () => {
    expect(
      getInjectableBunch({
        _someField: true,
      }),
    ).toMatchObject({
      _someField: true,
    });
  });

  it('correctly reports itself as an injectable bunch', () => {
    expect(
      isInjectableBunch(
        getInjectableBunch({
          _someField: true,
        }),
      ),
    ).toBe(true);
  });

  it('arrays are still reported as arrays', () => {
    expect(Array.isArray(getInjectableBunch([]))).toBe(true);
  });
});
