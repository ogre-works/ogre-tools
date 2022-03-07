import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import getInjectable from './getInjectable';

describe('getInjectable', () => {
  it('when called, returns identity with lifecycle added', () => {
    const actual = getInjectable({ some: 'injectable' });

    expect(actual).toEqual({
      some: 'injectable',
      lifecycle: lifecycleEnum.singleton,
    });
  });
});
