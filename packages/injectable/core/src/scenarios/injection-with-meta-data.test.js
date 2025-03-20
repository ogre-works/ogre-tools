import getInjectable from '../getInjectable/getInjectable';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import createContainer from '../dependency-injection-container/createContainer';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';

describe('injection with meta data', () => {
  it('given injecting many sync injectable with meta data, does so', () => {
    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token-id',
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
      injectionToken: someInjectionToken,
    });

    const di = createContainer('irrelevant');

    di.register(someInjectable);

    const actual = di.injectManyWithMeta(someInjectionToken);

    expect(actual).toEqual([
      {
        instance: 'some-instance',
        meta: { id: 'some-injectable' },
      },
    ]);
  });

  it('given injecting sync injectable with meta data, does so', () => {
    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token-id',
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
      injectionToken: someInjectionToken,
    });

    const di = createContainer('irrelevant');

    di.register(someInjectable);

    const actual = di.injectWithMeta(someInjectionToken);

    expect(actual).toEqual({
      instance: 'some-instance',
      meta: { id: 'some-injectable' },
    });
  });

  it('given scope, when injecting many sync injectable with meta data, does so', () => {
    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token-id',
    });

    const registerInScopeInjectable = getInjectable({
      id: 'some-scope',

      instantiate: di => injectable => {
        di.register(injectable);
      },

      scope: true,
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 'some-instance',
      injectionToken: someInjectionToken,
    });

    const di = createContainer('irrelevant');

    di.register(registerInScopeInjectable);

    const registerInScope = di.inject(registerInScopeInjectable);

    registerInScope(someInjectable);

    const actual = di.injectManyWithMeta(someInjectionToken);

    expect(actual).toEqual([
      {
        instance: 'some-instance',
        meta: { id: 'some-scope:some-injectable' },
      },
    ]);
  });

  it('given scope, when injecting many async injectable with meta data, does so', async () => {
    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token-id',
    });

    const registerInScopeInjectable = getInjectable({
      id: 'some-scope',

      instantiate: di => injectable => {
        di.register(injectable);
      },

      scope: true,
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: async () => 'some-instance',
      injectionToken: someInjectionToken,
    });

    const di = createContainer('irrelevant');

    di.register(registerInScopeInjectable);

    const registerInScope = di.inject(registerInScopeInjectable);

    registerInScope(someInjectable);

    const actual = di.injectManyWithMeta(someInjectionToken);

    expect(actual).toEqual([
      {
        instance: expect.any(Promise),
        meta: { id: 'some-scope:some-injectable' },
      },
    ]);

    expect(await actual[0].instance).toBe('some-instance');
  });

  it('given injecting many async injectable with meta data, does so', async () => {
    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token-id',
    });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: async () => 'some-instance',
      injectionToken: someInjectionToken,
    });

    const di = createContainer('irrelevant');

    di.register(someInjectable);

    const actual = di.injectManyWithMeta(someInjectionToken);

    expect(actual).toEqual([
      {
        instance: expect.any(Promise),
        meta: { id: 'some-injectable' },
      },
    ]);

    expect(await actual[0].instance).toBe('some-instance');
  });

  it('given injecting many sync injectables with meta data from within a child injectable, does so', () => {
    const someParentInjectable = getInjectable({
      id: 'some-parent-injectable',
      instantiate: di => di.injectManyWithMeta(someInjectionToken),
    });

    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token-id',
    });

    const someChildInjectable = getInjectable({
      id: 'some-child-injectable',
      instantiate: () => 'some-instance',
      injectionToken: someInjectionToken,
    });

    const di = createContainer('irrelevant');

    di.register(someParentInjectable, someChildInjectable);

    const actual = di.inject(someParentInjectable);

    expect(actual).toEqual([
      {
        instance: 'some-instance',
        meta: { id: 'some-child-injectable' },
      },
    ]);
  });

  it('given injecting many async injectables with meta data from within a child injectable, does so', async () => {
    const someParentInjectable = getInjectable({
      id: 'some-parent-injectable',
      instantiate: async di => di.injectManyWithMeta(someInjectionToken),
    });

    const someInjectionToken = getInjectionToken({
      id: 'some-injection-token-id',
    });

    const someChildInjectable = getInjectable({
      id: 'some-child-injectable',
      instantiate: async () => 'some-instance',
      injectionToken: someInjectionToken,
    });

    const di = createContainer('irrelevant');

    di.register(someParentInjectable, someChildInjectable);

    const actual = await di.inject(someParentInjectable);

    expect(actual).toEqual([
      {
        instance: expect.any(Promise),
        meta: { id: 'some-child-injectable' },
      },
    ]);

    expect(await actual[0].instance).toBe('some-instance');
  });

  it('given injectables, when injecting many with custom root context, works', () => {
    const injectionToken = getInjectionToken({ id: 'some-injection-token' });

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 42,
      injectionToken,
    });

    const di = createContainer('some-container');

    di.register(someInjectable);

    const actual = di.injectManyWithMeta(injectionToken, undefined, {
      injectable: {
        id: 'some-custom-context-id',
        lifecycle: lifecycleEnum.transient,
      },
    });

    expect(actual).toEqual([{ instance: 42, meta: { id: 'some-injectable' } }]);
  });

  it('given injectables, when injecting with meta with an injectable, works', () => {
    const di = createContainer('some-container');

    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 42,
    });

    const someOtherInjectable = getInjectable({
      id: 'some-other-injectable',
      instantiate: di => di.injectWithMeta(someInjectable),
    });

    di.register(someInjectable, someOtherInjectable);

    const actual = di.inject(someOtherInjectable);

    expect(actual).toEqual({
      instance: 42,
      meta: { id: 'some-injectable' },
    });
  });
});
