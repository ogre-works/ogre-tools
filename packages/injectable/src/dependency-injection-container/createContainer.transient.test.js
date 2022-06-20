import lifecycleEnum from './lifecycleEnum';
import getInjectionToken from '../getInjectionToken/getInjectionToken';
import getInjectable from '../getInjectable/getInjectable';
import createContainer from './createContainer';

describe('createContainer.transient', () => {
  it('given instantiation parameter, when injected multiple times, injects different instances', () => {
    const transientInjectable = getInjectable({
      id: 'irrelevant',
      instantiate: (_, instantiationParameter) => ({ instantiationParameter }),
      lifecycle: lifecycleEnum.transient,
    });

    const di = createContainer('some-container');

    di.register(transientInjectable);

    const actual1 = di.inject(
      transientInjectable,
      'some-instantiation-parameter',
    );

    const actual2 = di.inject(
      transientInjectable,
      'some-instantiation-parameter',
    );

    expect(actual1).not.toBe(actual2);
  });

  it('given no instantiation parameter, when injected multiple times, injects different instances', () => {
    const transientInjectable = getInjectable({
      id: 'irrelevant',
      instantiate: () => ({}),
      lifecycle: lifecycleEnum.transient,
    });

    const di = createContainer('some-container');

    di.register(transientInjectable);

    const actual1 = di.inject(transientInjectable);
    const actual2 = di.inject(transientInjectable);

    expect(actual1).not.toBe(actual2);
  });

  it('given multiple transient injectables, when injecting many with an instantiation parameter, injects the injectables using the instantiation parameter', () => {
    const someSharedInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      injectionToken: someSharedInjectionToken,
      lifecycle: lifecycleEnum.transient,

      instantiate: (di, instantiationParameter) =>
        `some-instance: "${instantiationParameter}"`,
    });

    const di = createContainer('some-container');

    di.register(someInjectable);

    const actual = di.injectMany(
      someSharedInjectionToken,
      'some-instantiation-parameter',
    );

    expect(actual).toEqual(['some-instance: "some-instantiation-parameter"']);
  });
});
