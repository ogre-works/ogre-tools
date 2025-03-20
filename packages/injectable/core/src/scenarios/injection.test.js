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
});
