import getInjectionToken from './getInjectionToken';

describe('getInjectionToken', () => {
  it('when called, returns a unique reference', () => {
    const actual1 = getInjectionToken({ id: 'some-id' });
    const actual2 = getInjectionToken({ id: 'some-other-id' });

    expect(actual1).not.toBe(actual2);
  });
});
