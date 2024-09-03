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

    const actual = await di.injectMany(someSharedInjectionToken);

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

  it('given injectables with a dependency cycle, when injecting many, throws', () => {
    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    const someOtherInjectionToken = getInjectionToken({
      id: 'some-other-injection-token',
    });

    const childInjectable = getInjectable({
      id: 'some-child-injectable',
      injectionToken: someOtherInjectionToken,
      instantiate: di => di.injectMany(someInjectionToken),
    });

    const parentInjectable = getInjectable({
      id: 'some-parent-injectable',
      injectionToken: someInjectionToken,
      instantiate: di => di.injectMany(someOtherInjectionToken),
    });

    const di = createContainer('some-container');

    di.register(parentInjectable, childInjectable);

    expect(() => {
      di.injectMany(someInjectionToken);
    }).toThrow(
      'Cycle of injectables encountered: "some-injection-token" -> "some-parent-injectable" -> "some-other-injection-token" -> "some-child-injectable" -> "some-injection-token"',
    );
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

  it('given injectables with a dependency cycle, when injecting many with custom root context, throws error with the custom context', () => {
    const injectionToken = getInjectionToken({ id: 'some-injection-token' });

    const childInjectable = getInjectable({
      id: 'some-child-injectable',
      instantiate: di => di.context,
    });

    const parentInjectable = getInjectable({
      id: 'some-parent-injectable',
      instantiate: di => di.inject(childInjectable),
      injectionToken,
    });

    const di = createContainer('some-container');

    di.register(parentInjectable, childInjectable);

    const actualContext = di
      .inject(injectionToken, undefined, {
        injectable: {
          id: 'some-custom-context-id',
          lifecycle: lifecycleEnum.transient,
        },
      })
      .map(x => x.injectable.id);

    expect(actualContext).toEqual([
      'some-container',
      'some-custom-context-id',
      'some-parent-injectable',
      'some-child-injectable',
    ]);
  });

  it('given injectables, when injecting many with custom root context, works', () => {
    const injectionToken = getInjectionToken({ id: 'some-injection-token' });

    const someInjectable = getInjectable({
      id: 'some-some-injectable',
      instantiate: () => 42,
      injectionToken,
    });

    const di = createContainer('some-container');

    di.register(someInjectable);

    const actual = di.injectMany(injectionToken, undefined, {
      injectable: {
        id: 'some-custom-context-id',
        lifecycle: lifecycleEnum.transient,
      },
    });

    expect(actual).toEqual([42]);
  });
});
