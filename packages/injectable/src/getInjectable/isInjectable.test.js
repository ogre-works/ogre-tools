import isInjectable from './isInjectable';
import getInjectable from './getInjectable';
import getInjectionToken from '../getInjectionToken/getInjectionToken';

describe('isInjectable', () => {
  it('an injectable is an injectable', () => {
    const someInjectable = getInjectable({
      id: 'irrelevant',
      instantiate: () => 'irrelevant',
    });

    const actual = isInjectable(someInjectable);

    expect(actual).toBe(true);
  });

  it('a thing mimicking an injectable is not an injectable', () => {
    const someInjectableMimick = {
      id: 'irrelevant',
      instantiate: () => 'irrelevant',
    };

    const actual = isInjectable(someInjectableMimick);

    expect(actual).toBe(false);
  });

  it('an injection token is not an injectable', () => {
    const someInjectionToken = getInjectionToken({
      id: 'irrelevant',
    });

    const actual = isInjectable(someInjectionToken);

    expect(actual).toBe(false);
  });

  it('a primitive is not an injectable', () => {
    const somePrimitive = null;

    const actual = isInjectable(somePrimitive);

    expect(actual).toBe(false);
  });
});
