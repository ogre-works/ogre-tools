import getInjectable from '../getInjectable/getInjectable';
import createContainer from '../dependency-injection-container/createContainer';
import getInjectionToken from '../getInjectionToken/getInjectionToken';

describe('createContainer.prevent-overrides-of-already-injected-injectables', () => {
  let di;

  beforeEach(() => {
    di = createContainer('some-container');
  });

  it('given injectable and already injected, when overridden, throws', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
    });

    di.register(someInjectable);

    di.inject(someInjectable);

    expect(() => {
      di.override(someInjectable, () => 'irrelevant');
    }).toThrow(expectedError);
  });

  it('given adHoc-injectable and already injected, when overridden, throws', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
      adHoc: true,
    });

    di.inject(someInjectable);

    expect(() => {
      di.override(someInjectable, () => 'irrelevant');
    }).toThrow(expectedError);
  });

  it('given injectable and already injected using an injection token, when overridden, throws', () => {
    const someInjectionToken = getInjectionToken({ id: 'irrelevant' });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
      injectionToken: someInjectionToken,
    });

    di.register(someInjectable);

    di.inject(someInjectionToken);

    expect(() => {
      di.override(someInjectable, () => 'irrelevant');
    }).toThrow(expectedError);
  });

  it('given injectable and already injected as many using an injection token, when overridden, throws', () => {
    const someInjectionToken = getInjectionToken({ id: 'irrelevant' });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
      injectionToken: someInjectionToken,
    });

    di.register(someInjectable);

    di.injectMany(someInjectionToken);

    expect(() => {
      di.override(someInjectable, () => 'irrelevant');
    }).toThrow(expectedError);
  });

  it('given injectable and already injected, but purged, when overridden, still throws', () => {
    const someInjectionToken = getInjectionToken({ id: 'irrelevant' });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'irrelevant',
      injectionToken: someInjectionToken,
    });

    di.register(someInjectable);

    di.inject(someInjectable);

    di.purge(someInjectable);

    expect(() => {
      di.override(someInjectable, () => 'irrelevant');
    }).toThrow(expectedError);
  });
});

const expectedError =
  'Tried to override injectable "some-injectable", but it was already injected.';
