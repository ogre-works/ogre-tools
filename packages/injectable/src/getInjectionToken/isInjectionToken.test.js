import isInjectionToken from './isInjectionToken';
import getInjectionToken from './getInjectionToken';
import getInjectable from '../getInjectable/getInjectable';

describe('isInjectionToken', () => {
  it('an injection token is an injection token', () => {
    const someInjectionToken = getInjectionToken({
      id: 'irrelevant',
      instantiate: () => 'irrelevant',
    });

    const actual = isInjectionToken(someInjectionToken);

    expect(actual).toBe(true);
  });

  it('a thing mimicking an injectable is not an injectable', () => {
    const someTokenMimick = {
      id: 'irrelevant',
    };

    const actual = isInjectionToken(someTokenMimick);

    expect(actual).toBe(false);
  });

  it('an injectable is not an injection token', () => {
    const someInjectable = getInjectable({
      id: 'irrelevant',
      instantiate: () => 'irrelevant',
    });

    const actual = isInjectionToken(someInjectable);

    expect(actual).toBe(false);
  });

  it('a primitive is not an injection token', () => {
    const somePrimitive = null;

    const actual = isInjectionToken(somePrimitive);

    expect(actual).toBe(false);
  });
});
