import getInjectionToken from './getInjectionToken';

describe('getInjectionToken', () => {
  it('when called, returns a unique reference', () => {
    const actual1 = getInjectionToken();
    const actual2 = getInjectionToken();

    expect(actual1).not.toBe(actual2);
  });
});
