import isInjectionToken from './isInjectionToken';
import {
  getInjectionToken,
  getSpecificInjectionToken,
} from './getInjectionToken';
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

  it('a token is decorable by default', () => {
    const actual = getInjectionToken({ id: 'irrelevant' });

    expect(actual).toHaveProperty('decorable', true);
  });

  it('a non-decorable token is so', () => {
    const actual = getInjectionToken({ id: 'irrelevant', decorable: false });

    expect(actual).toHaveProperty('decorable', false);
  });

  it('a general token is decorable by default', () => {
    const actual = getInjectionToken({ id: 'irrelevant' });

    expect(actual).toHaveProperty('decorable', true);
  });

  it('a general non-decorable token is so', () => {
    const actual = getInjectionToken({
      id: 'irrelevant',
      decorable: false,
    });

    expect(actual).toHaveProperty('decorable', false);
  });

  it('a specific token is decorable by default', () => {
    const actual = getSpecificInjectionToken({ id: 'irrelevant' });

    expect(actual).toHaveProperty('decorable', true);
  });

  it('a specific non-decorable token is so', () => {
    const actual = getSpecificInjectionToken({
      id: 'irrelevant',
      decorable: false,
    });

    expect(actual).toHaveProperty('decorable', false);
  });

  it('a specific token created by general token is decorable by default', () => {
    const actual = getInjectionToken({ id: 'irrelevant' }).for('irrelevant');

    expect(actual).toHaveProperty('decorable', true);
  });

  it('a specific token created by non-decorable general token is non-decorable', () => {
    const actual = getInjectionToken({
      id: 'irrelevant',
      decorable: false,
    }).for('irrelevant');

    expect(actual).toHaveProperty('decorable', false);
  });

  it('a specific decorable token created by non-decorable general token is still non-decorable', () => {
    const actual = getInjectionToken({
      id: 'irrelevant',
      decorable: false,
      specificInjectionTokenFactory: () =>
        getSpecificInjectionToken({ id: 'irrelevant', decorable: true }),
    }).for();

    expect(actual).toHaveProperty('decorable', false);
  });
});
