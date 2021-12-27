import getInjectable from './getInjectable';

describe('getInjectable', () => {
  it('when called, returns identity', () => {
    const actual = getInjectable({ some: 'injectable' });

    expect(actual).toEqual({ some: 'injectable' });
  });
});
