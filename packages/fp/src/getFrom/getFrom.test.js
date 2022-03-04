import getSafeFrom from './getFrom';

describe('getSafeFrom', () => {
  it('when getting existing value, returns value', () => {
    const actual = getSafeFrom({ someProperty: 'some-value' })('someProperty');

    expect(actual).toBe('some-value');
  });

  it('when getting non existing value, return undefined', () => {
    const actual = getSafeFrom({})('someNonExistingProperty');

    expect(actual).toBeUndefined();
  });

  it('when getting existing nested value, returns value', () => {
    const actual = getSafeFrom({ someRoot: { someProperty: 'some-value' } })(
      'someRoot.someProperty',
    );

    expect(actual).toBe('some-value');
  });
});
