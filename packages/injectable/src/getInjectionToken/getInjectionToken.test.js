import getInjectionToken from './getInjectionToken';

describe('getInjectionToken', () => {
  it('when called, returns a unique reference', () => {
    const actual1 = getInjectionToken({ module: {} });
    const actual2 = getInjectionToken({ module: {} });

    expect(actual1).not.toBe(actual2);
  });
});
