import getSafeFrom from './getSafeFrom';

describe('getSafeFrom', () => {
  it('when getting existing value, returns value', () => {
    const actual = getSafeFrom({ someProperty: 'some-value' })('someProperty');

    expect(actual).toBe('some-value');
  });

  it('when getting non existing value, throws', () => {
    expect(() => {
      getSafeFrom({ someProperty: 'irrelevant' })('someNonExistingProperty');
    }).toThrow(
      'Tried to get unknown property "someNonExistingProperty" from an object. Available properties are:\n\nsomeProperty',
    );
  });

  it('when getting existing nested value, returns value', () => {
    const actual = getSafeFrom({ someRoot: { someProperty: 'some-value' } })(
      'someRoot.someProperty',
    );

    expect(actual).toBe('some-value');
  });
});
