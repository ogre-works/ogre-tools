import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import getInjectable from '../getInjectable/getInjectable';
import createContainer from '../dependency-injection-container/createContainer';
import getInjectionToken from '../getInjectionToken/getInjectionToken';

describe('createContainer.override', () => {
  it('given an injectable is overridden, injects the overridden injectable', () => {
    const childInjectable = getInjectable({
      id: 'some-injectable',

      instantiate: () => {
        throw Error('Should not come here');
      },
    });

    const parentInjectable = getInjectable({
      id: 'some-other-injectable',

      instantiate: di => di.inject(childInjectable),
    });

    const di = createContainer('some-container');

    di.register(childInjectable, parentInjectable);

    di.override(childInjectable, () => 'some-overridden-value');

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-overridden-value');
  });

  it('given transient and overridden, when injected with instantiation parameter, provides override with way to inject using instantiation parameter', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
      lifecycle: lifecycleEnum.transient,
    });

    const someOtherInjectable = getInjectable({
      id: 'some-other-injectable',
      instantiate: (_, instantiationParameter) => instantiationParameter,
      lifecycle: lifecycleEnum.transient,
    });

    const di = createContainer('some-container');

    di.register(someInjectable, someOtherInjectable);

    di.override(someInjectable, (di, instantiationParameter) =>
      di.inject(someOtherInjectable, instantiationParameter),
    );

    const actual = di.inject(someInjectable, 'some-instantiation-parameter');

    expect(actual).toBe('some-instantiation-parameter');
  });

  it('given singleton and overridden, when injected, provides override with way to inject', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
      lifecycle: lifecycleEnum.transient,
    });

    const someOtherInjectable = getInjectable({
      id: 'some-other-injectable',
      instantiate: () => 'some-other-instance',
      lifecycle: lifecycleEnum.transient,
    });

    const di = createContainer('some-container');

    di.register(someInjectable, someOtherInjectable);

    di.override(someInjectable, di => di.inject(someOtherInjectable));

    const actual = di.inject(someInjectable, 'some-other-instance');

    expect(actual).toBe('some-other-instance');
  });

  it('given an injectable is overridden twice, injects the last overridden injectable', () => {
    const childInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
    });

    const parentInjectable = getInjectable({
      id: 'some-other-injectable',
      instantiate: di => di.inject(childInjectable),
    });

    const di = createContainer('some-container');

    di.register(childInjectable, parentInjectable);

    di.override(childInjectable, () => 'irrelevant');
    di.override(childInjectable, () => 'some-reoverridden-value');

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-reoverridden-value');
  });

  it('given an injectable is overridden, but overrides are reset, injects the original injectable', () => {
    const childInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-original-value',
    });

    const parentInjectable = getInjectable({
      id: 'some-other-injectable',
      instantiate: di => di.inject(childInjectable),
    });

    const di = createContainer('some-container');

    di.register(childInjectable, parentInjectable);

    di.override(childInjectable, () => 'irrelevant');

    di.reset();

    const actual = di.inject(parentInjectable);

    expect(actual).toBe('some-original-value');
  });

  it('given an injectable is overridden, but then unoverriden, injects the original injectable', () => {
    const someInjectable = getInjectable({
      id: 'irrelevant',
      instantiate: () => 'some-original-value',
    });

    const di = createContainer('some-container');

    di.register(someInjectable);

    di.override(someInjectable, () => 'irrelevant');

    di.unoverride(someInjectable);

    const actual = di.inject(someInjectable);

    expect(actual).toBe('some-original-value');
  });

  it('given an injectable with injection token is overridden, but then unoverriden using injectionToken, injects the original injectable', () => {
    const someInjectionToken = getInjectionToken('irrelevant');

    const someInjectable = getInjectable({
      id: 'irrelevant',
      instantiate: () => 'some-original-value',
      injectionToken: someInjectionToken,
    });

    const di = createContainer('some-container');

    di.register(someInjectable);

    di.override(someInjectionToken, () => 'irrelevant');

    di.unoverride(someInjectionToken);

    const actual = di.inject(someInjectable);

    expect(actual).toBe('some-original-value');
  });

  it('given an injectable with injection token is overridden, but then unoverridden using injectable, injects the original injectable', () => {
    const someInjectionToken = getInjectionToken('irrelevant');

    const someInjectable = getInjectable({
      id: 'irrelevant',
      instantiate: () => 'some-original-value',
      injectionToken: someInjectionToken,
    });

    const di = createContainer('some-container');

    di.register(someInjectable);

    di.override(someInjectionToken, () => 'irrelevant');

    di.unoverride(someInjectable);

    const actual = di.inject(someInjectable);

    expect(actual).toBe('some-original-value');
  });

  it('given an injectable, but not overridden, when unoverridden, throws', () => {
    const someInjectable = getInjectable({
      id: 'irrelevant',
      instantiate: () => 'some-original-value',
    });

    const di = createContainer('some-container');

    di.register(someInjectable);

    expect(() => {
      di.unoverride(someInjectable);
    }).toThrow('Tried to unoverride "irrelevant", but it was not overridden.');
  });

  it('given an injectable, but not registered, when unoverridden, throws', () => {
    const someInjectable = getInjectable({
      id: 'irrelevant',
      instantiate: () => 'some-original-value',
    });

    const di = createContainer('some-container');

    expect(() => {
      di.unoverride(someInjectable);
    }).toThrow('Tried to unoverride "irrelevant", but it was not registered.');
  });

  it('when overriding non-registered injectable, throws', () => {
    const di = createContainer('some-container');

    const injectable = getInjectable({
      id: 'some-non-registered-injectable',
    });

    expect(() => {
      di.override(injectable, () => 'irrelevant');
    }).toThrow(
      'Tried to override "some-non-registered-injectable" which is not registered.',
    );
  });

  it('given overridden injectable with injection token, when injected using injection token, injects the overridden instance', () => {
    const di = createContainer('some-container');

    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const injectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
      injectionToken: someInjectionToken,
    });

    di.register(injectable);

    di.override(injectable, () => 'some-override');

    const actual = di.inject(someInjectionToken);

    expect(actual).toBe('some-override');
  });

  it('given overridden injectable with injection token, when injected many using injection token, injects the overridden instance', () => {
    const di = createContainer('some-container');

    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const injectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
      injectionToken: someInjectionToken,
    });

    di.register(injectable);

    di.override(injectable, () => 'some-override');

    const actual = di.injectMany(someInjectionToken);

    expect(actual).toEqual(['some-override']);
  });

  it('given single registered injectable with injection token, and the injection token is overridden, when the injection token is inject-singled, injects the overridden instance', () => {
    const di = createContainer('some-container');

    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const injectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
      injectionToken: someInjectionToken,
    });

    di.register(injectable);

    di.override(someInjectionToken, () => 'some-override');

    const actual = di.inject(someInjectionToken);

    expect(actual).toBe('some-override');
  });

  it('given single registered injectable with injection token, and the injection token is overridden, when the injection token is inject-many, injects the overridden instance', () => {
    const di = createContainer('some-container');

    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const injectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
      injectionToken: someInjectionToken,
    });

    di.register(injectable);

    di.override(someInjectionToken, () => 'some-override');

    const actual = di.injectMany(someInjectionToken);

    expect(actual).toEqual(['some-override']);
  });

  it('given multiple registered injectables with injection token, and the injection token is overridden, throws', () => {
    const di = createContainer('some-container');

    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const injectable1 = getInjectable({
      id: 'some-injectable-1',
      instantiate: () => 'irrelevant',
      injectionToken: someInjectionToken,
    });

    const injectable2 = getInjectable({
      id: 'some-injectable-2',
      instantiate: () => 'irrelevant',
      injectionToken: someInjectionToken,
    });

    di.register(injectable1, injectable2);

    expect(() => {
      di.override(someInjectionToken, () => 'some-override');
    }).toThrow(
      'Tried to override single implementation of injection token "some-injection-token", but found multiple registered implementations: "some-injectable-1", "some-injectable-2".',
    );
  });

  it('given no registered injectable with injection token, when the injection token is overridden, throws', () => {
    const di = createContainer('some-container');

    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    expect(() => {
      di.override(someInjectionToken, () => 'some-override');
    }).toThrow(
      'Tried to override single implementation of injection token "some-injection-token", but found no registered implementations.',
    );
  });
});
