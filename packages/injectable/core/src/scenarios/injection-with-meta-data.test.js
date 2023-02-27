import getInjectable from '../getInjectable/getInjectable';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import createContainer from '../dependency-injection-container/createContainer';
import getInjectionToken from '../getInjectionToken/getInjectionToken';

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

    const actual = await di.injectManyWithMeta(someInjectionToken);

    expect(actual).toEqual([
      {
        instance: 'some-instance',
        meta: { id: 'some-injectable' },
      },
    ]);
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
      instantiate: async di => await di.injectManyWithMeta(someInjectionToken),
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
        instance: 'some-instance',
        meta: { id: 'some-child-injectable' },
      },
    ]);
  });

  xit('given injectables with a dependency cycle, when injecting many with meta and with custom root context, throws error with the custom context', () => {
    const injectionToken = getInjectionToken({ id: 'some-injection-token' });

    const childInjectable = getInjectable({
      id: 'some-child-injectable',
      instantiate: di => di.inject(parentInjectable),
      injectionToken,
    });

    const parentInjectable = getInjectable({
      id: 'some-parent-injectable',
      instantiate: di => di.inject(childInjectable),
      injectionToken,
    });

    const di = createContainer('some-container');

    di.register(parentInjectable, childInjectable);

    expect(() => {
      di.injectManyWithMeta(injectionToken, undefined, {
        injectable: {
          id: 'some-custom-context-id',
        },
      });
    }).toThrow(
      'Cycle of injectables encountered: "some-container" -> "some-custom-context-id" -> "some-injection-token" -> "some-parent-injectable" -> "some-child-injectable" -> "some-parent-injectable"',
    );
  });
});
