import getInjectable from '../getInjectable/getInjectable';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import createContainer from '../dependency-injection-container/createContainer';

describe('createContainer.injection', () => {
  it('given async child-injectable as dependency, when injected, parent-injectable receives child as sync', async () => {
    const asyncChildInjectable = getInjectable({
      id: 'some-child-injectable',

      instantiate: () =>
        Promise.resolve({
          someProperty: `some-child-instance`,
        }),
    });

    const parentInjectable = getInjectable({
      id: 'some-parent-injectable',

      instantiate: async di => {
        const childInjectable = await di.inject(asyncChildInjectable);

        return childInjectable.someProperty;
      },
    });

    const di = createContainer('some-container');

    di.register(asyncChildInjectable, parentInjectable);

    const actual = await di.inject(parentInjectable);

    expect(actual).toBe('some-child-instance');
  });

  xit('given sync injectables with a dependency cycle, when injected, throws', () => {
    const childInjectable = getInjectable({
      id: 'some-child-injectable',
      instantiate: di => di.inject(parentInjectable),
    });

    const parentInjectable = getInjectable({
      id: 'some-parent-injectable',
      instantiate: di => di.inject(childInjectable),
    });

    const di = createContainer('some-container');

    di.register(parentInjectable, childInjectable);

    expect(() => {
      di.inject(parentInjectable);
    }).toThrow(
      'Cycle of injectables encountered: "some-container" -> "some-parent-injectable" -> "some-child-injectable" -> "some-parent-injectable"',
    );
  });

  xit('given sync injectables with a dependency cycle, when injected with custom root context, throws error with the custom context', () => {
    const childInjectable = getInjectable({
      id: 'some-child-injectable',
      instantiate: di => di.inject(parentInjectable),
    });

    const parentInjectable = getInjectable({
      id: 'some-parent-injectable',
      instantiate: di => di.inject(childInjectable),
    });

    const di = createContainer('some-container');

    di.register(parentInjectable, childInjectable);

    expect(() => {
      di.inject(parentInjectable, undefined, {
        injectable: {
          id: 'some-custom-context-id',
          lifecycle: lifecycleEnum.transient,
        },
      });
    }).toThrow(
      'Cycle of injectables encountered: "some-container" -> "some-custom-context-id" -> "some-parent-injectable" -> "some-child-injectable" -> "some-parent-injectable"',
    );
  });

  it('given injectable, when injected with custom root context, works', () => {
    const someInjectable = getInjectable({
      id: 'some-injectable',
      instantiate: () => 42,
    });

    const di = createContainer('some-container');

    di.register(someInjectable);

    const actual = di.inject(someInjectable, undefined, {
      injectable: {
        id: 'some-custom-context-id',
        lifecycle: lifecycleEnum.transient,
      },
    });

    expect(actual).toBe(42);
  });

  xit('given async injectables with a dependency cycle, when injected, throws', () => {
    const childInjectable = getInjectable({
      id: 'some-child-injectable',
      instantiate: async di => await di.inject(parentInjectable),
    });

    const parentInjectable = getInjectable({
      id: 'some-parent-injectable',
      instantiate: async di => await di.inject(childInjectable),
    });

    const di = createContainer('some-container');

    di.register(parentInjectable, childInjectable);

    const actualPromise = di.inject(parentInjectable);

    return expect(actualPromise).rejects.toThrow(
      'Cycle of injectables encountered: "some-container" -> "some-parent-injectable" -> "some-child-injectable" -> "some-parent-injectable"',
    );
  });
});
