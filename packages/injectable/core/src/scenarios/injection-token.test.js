import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import getInjectable from '../getInjectable/getInjectable';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import createContainer from '../dependency-injection-container/createContainer';

describe('createContainer.injection-token', () => {
  it('given multiple injectables with shared injection token, when injecting using the token, throws', () => {
    const someSharedInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      injectionToken: someSharedInjectionToken,
      instantiate: () => 'irrelevant',
    });

    const someOtherInjectable = getInjectable({
      id: 'some-other-injectable',
      injectionToken: someSharedInjectionToken,
      instantiate: () => 'irrelevant',
    });

    const di = createContainer('some-container');

    di.register(someInjectable, someOtherInjectable);

    expect(() => {
      di.inject(someSharedInjectionToken);
    }).toThrow(
      `Tried to inject single injectable for injection token "some-injection-token" but found multiple injectables: "some-injectable", "some-other-injectable"`,
    );
  });

  it('given injection token and injectable with same ID, when injecting, does not throw', () => {
    const di = createContainer('some-container');

    const someInjectionToken = getInjectionToken({ id: 'some-id' });

    const someInjectable = getInjectable({
      id: 'some-id',
      injectionToken: someInjectionToken,
      instantiate: () => {},
    });

    di.register(someInjectable);

    expect(() => di.inject(someInjectionToken)).not.toThrow();
  });

  it('given multiple sync injectables with shared injection token, when injecting many using the token, injects all injectables with the shared token', () => {
    const someSharedInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      injectionToken: someSharedInjectionToken,
      instantiate: () => 'some-instance',
    });

    const someOtherInjectable = getInjectable({
      id: 'some-other-injectable',
      injectionToken: someSharedInjectionToken,
      instantiate: () => 'some-other-instance',
    });

    const someUnrelatedInjectable = getInjectable({
      id: 'some-unrelated-injectable',
      instantiate: () => 'some-other-instance',
    });

    const di = createContainer('some-container');

    di.register(someInjectable, someOtherInjectable, someUnrelatedInjectable);

    const actual = di.injectMany(someSharedInjectionToken);

    expect(actual).toEqual(['some-instance', 'some-other-instance']);
  });

  it('given multiple sync and async injectables with shared injection token, when injecting many using the token, injects all injectables with the shared token', async () => {
    const someSharedInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const someSyncInjectable = getInjectable({
      id: 'some-injectable',
      injectionToken: someSharedInjectionToken,
      instantiate: () => 'some-instance',
    });

    const someAsyncInjectable = getInjectable({
      id: 'some-other-injectable',
      injectionToken: someSharedInjectionToken,
      instantiate: async () => 'some-other-instance',
    });

    const someUnrelatedInjectable = getInjectable({
      id: 'some-unrelated-injectable',
      instantiate: () => 'some-unrelated-instance',
    });

    const di = createContainer('some-container');

    di.register(
      someSyncInjectable,
      someAsyncInjectable,
      someUnrelatedInjectable,
    );

    const actual = di.injectMany(someSharedInjectionToken);

    expect(actual).toEqual(['some-instance', expect.any(Promise)]);
  });

  it('given no injectables, when injecting many, injects no instances', async () => {
    const someSharedInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const di = createContainer('some-container');

    const actual = di.injectMany(
      someSharedInjectionToken,
      'some-instantiation-parameter',
    );

    expect(actual).toEqual([]);
  });

  it('given injectable with injection token, when injected using injection token, injects', () => {
    const injectionToken = getInjectionToken({ id: 'some-injection-token' });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
      injectionToken: injectionToken,
    });

    const di = createContainer('some-container');

    di.register(someInjectable);

    expect(di.inject(injectionToken)).toBe('some-instance');
  });
});
