import getFrom from './getFrom';

describe('getFrom', () => {
  it('when getting existing value, returns value', () => {
    const actual = getFrom({ someProperty: 'some-value' })('someProperty');

    expect(actual).toBe('some-value');
  });

  it('when getting non existing value, return undefined', () => {
    const actual = getFrom({})('someNonExistingProperty');

    expect(actual).toBeUndefined();
  });

  it('when getting existing nested value, returns value', () => {
    const actual = getFrom({ someRoot: { someProperty: 'some-value' } })(
      'someRoot.someProperty',
    );

    expect(actual).toBe('some-value');
  });
});
