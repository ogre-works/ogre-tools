import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import createContainer from '../dependency-injection-container/createContainer';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

describe('getNumberOfInstances', () => {
  let di;

  beforeEach(() => {
    di = createContainer('some-container');
  });

  it('given no injectables registered, returns empty object', () => {
    expect(di.getNumberOfInstances()).toEqual({});
  });

  it('given a singleton registered but not injected, returns empty object', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    di.register(someInjectable);

    expect(di.getNumberOfInstances()).toEqual({});
  });

  it('given a singleton registered and injected, returns count of 1', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    di.register(someInjectable);
    di.inject(someInjectable);

    expect(di.getNumberOfInstances()).toEqual({
      'some-injectable': 1,
    });
  });

  it('given a keyed singleton injected with multiple keys, returns count matching number of keys', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: (di, key) => `instance-${key}`,
      lifecycle: lifecycleEnum.keyedSingleton({
        getInstanceKey: (di, key) => key,
      }),
    });

    di.register(someInjectable);
    di.inject(someInjectable, 'key-1');
    di.inject(someInjectable, 'key-2');
    di.inject(someInjectable, 'key-3');

    expect(di.getNumberOfInstances()).toEqual({
      'some-injectable': 3,
    });
  });

  it('given a transient injectable injected, it does not appear in counts', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
      lifecycle: lifecycleEnum.transient,
    });

    di.register(someInjectable);
    di.inject(someInjectable);

    expect(di.getNumberOfInstances()).toEqual({});
  });

  it('given a singleton injected and then purged, returns empty object', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    di.register(someInjectable);
    di.inject(someInjectable);
    di.purge(someInjectable);

    expect(di.getNumberOfInstances()).toEqual({});
  });

  it('given a singleton injected and then deregistered, returns empty object', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    di.register(someInjectable);
    di.inject(someInjectable);
    di.deregister(someInjectable);

    expect(di.getNumberOfInstances()).toEqual({});
  });

  it('given a first injectable already injected, when a second injectable calls getNumberOfInstances during instantiation, returns count of existing instances', () => {
    let capturedCounts;

    const firstInjectable = getInjectable({
      id: 'first-injectable',
      instantiate: () => 'first-instance',
    });

    const secondInjectable = getInjectable({
      id: 'second-injectable',
      instantiate: di => {
        capturedCounts = di.getNumberOfInstances();
        return 'second-instance';
      },
    });

    di.register(firstInjectable, secondInjectable);
    di.inject(firstInjectable);
    di.inject(secondInjectable);

    expect(capturedCounts).toEqual({
      'first-injectable': 1,
    });
  });

  it('given a first injectable already injected, when an injectable2 calls getNumberOfInstances during instantiation, returns count of existing instances', () => {
    let capturedCounts;

    const firstInjectable = getInjectable({
      id: 'first-injectable',
      instantiate: () => 'first-instance',
    });

    const secondInjectable = getInjectable2({
      id: 'second-injectable',
      instantiate: di => {
        capturedCounts = di.getNumberOfInstances();
        return () => 'second-instance';
      },
    });

    di.register(firstInjectable, secondInjectable);
    di.inject(firstInjectable);
    di.inject(secondInjectable);

    expect(capturedCounts).toEqual({
      'first-injectable': 1,
    });
  });
});
