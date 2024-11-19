import getInjectable from '../getInjectable/getInjectable';
import createContainer from '../dependency-injection-container/createContainer';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

describe('access-to-already-injected-instances', () => {
  it('given an injectable but not registered, when accessing instances of said injectable, returns empty list', () => {
    const di = createContainer('irrelevant');

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    const instances = di.getInstances(someInjectable);

    expect(instances).toEqual([]);
  });

  it('given a injectable and registered, but not injected, when accessing instances of said injectable, returns empty list', () => {
    const di = createContainer('irrelevant');

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    di.register(someInjectable);

    const instances = di.getInstances(someInjectable);

    expect(instances).toEqual([]);
  });

  it('given a singleton injectable and registered and injected, when accessing instances of said injectable, returns list containing the instance', () => {
    const di = createContainer('irrelevant');

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
    });

    di.register(someInjectable);

    di.inject(someInjectable);

    const instances = di.getInstances(someInjectable);

    expect(instances).toEqual(['some-instance']);
  });

  it('given a singleton injectable implementing a token and registered and injected, when accessing instances of said token, returns list containing the instance', () => {
    const di = createContainer('irrelevant');

    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
      injectionToken: someInjectionToken,
    });

    di.register(someInjectable);

    di.inject(someInjectable);

    const instances = di.getInstances(someInjectionToken);

    expect(instances).toEqual(['some-instance']);
  });

  it('given a transient injectable and registered and injected, when accessing instances of said injectable, returns empty list of instance, because transient instances are not stored', () => {
    const di = createContainer('irrelevant');

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
      lifecycle: lifecycleEnum.transient,
    });

    di.register(someInjectable);

    di.inject(someInjectable);

    const instances = di.getInstances(someInjectable);

    expect(instances).toEqual([]);
  });

  it('given a keyed singleton injectable and registered and injected with different keys, when accessing instances of said injectable, returns list containing the instances', () => {
    const di = createContainer('irrelevant');

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: (di, key) => `some-instance-for-${key}`,
      lifecycle: lifecycleEnum.keyedSingleton({
        getInstanceKey: (di, key) => key,
      }),
    });

    di.register(someInjectable);

    di.inject(someInjectable, 'some-key-1');
    di.inject(someInjectable, 'some-key-2');

    const instances = di.getInstances(someInjectable);

    expect(instances).toEqual([
      'some-instance-for-some-key-1',
      'some-instance-for-some-key-2',
    ]);
  });

  it('given a keyed singleton injectable implementing a token and registered and injected with different keys, when accessing instances of said token, returns list containing the instances', () => {
    const di = createContainer('irrelevant');

    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: (di, key) => `some-instance-for-${key}`,

      lifecycle: lifecycleEnum.keyedSingleton({
        getInstanceKey: (di, key) => key,
      }),

      injectionToken: someInjectionToken,
    });

    di.register(someInjectable);

    di.inject(someInjectionToken, 'some-key-1');
    di.inject(someInjectionToken, 'some-key-2');

    const instances = di.getInstances(someInjectable);

    expect(instances).toEqual([
      'some-instance-for-some-key-1',
      'some-instance-for-some-key-2',
    ]);
  });

  it('given a keyed singleton injectable implementing a token and registered and "injected many" with different keys, when accessing instances of said token, returns list containing the instances', () => {
    const di = createContainer('irrelevant');

    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: (di, key) => `some-instance-for-${key}`,

      lifecycle: lifecycleEnum.keyedSingleton({
        getInstanceKey: (di, key) => key,
      }),

      injectionToken: someInjectionToken,
    });

    di.register(someInjectable);

    di.injectMany(someInjectionToken, 'some-key-1');
    di.injectMany(someInjectionToken, 'some-key-2');

    const instances = di.getInstances(someInjectable);

    expect(instances).toEqual([
      'some-instance-for-some-key-1',
      'some-instance-for-some-key-2',
    ]);
  });
});
