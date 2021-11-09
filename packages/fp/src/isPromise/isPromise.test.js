import isPromise from './isPromise';

describe('isPromise', () => {
  it('given promise, returns true', () => {
    const actual = isPromise(new Promise(() => {}));

    expect(actual).toBe(true);
  });

  it('given non-promise, returns false', () => {
    const actual = isPromise({});

    expect(actual).toBe(false);
  });

  it('given thenable, returns false', () => {
    const actual = isPromise({ then: () => {} });

    expect(actual).toBe(false);
  });
});
