import getDi from '../test-utils/getDiForUnitTesting';
import getInjectable from '../getInjectable/getInjectable';

import {
  plantUmlDependencyGraphInjectable,
  registerDependencyGraphing,
} from './extensions/dependency-graphing/dependency-graphing';

import getInjectionToken from '../getInjectionToken/getInjectionToken';
import lifecycleEnum from './lifecycleEnum';

describe('createContainer.dependency-graph', () => {
  it('given dependency graphing, dependencies and injected, creates Plant-UML graph', async () => {
    const parentInjectable = getInjectable({
      id: 'some-parent-injectable',

      instantiate: async di => {
        // Inject same injectable twice for coverage
        di.inject(syncChildInjectable);
        di.inject(syncChildInjectable);
        await di.inject(asyncChildInjectable);
        di.inject(keyedInjectable);
      },
    });

    const syncChildInjectable = getInjectable({
      id: 'some-sync-child-injectable',
      instantiate: di => di.injectMany(injectionToken),
      lifecycle: lifecycleEnum.transient,
    });

    const asyncChildInjectable = getInjectable({
      id: 'some-async-child-injectable',
      instantiate: async () => 'irrelevant',
    });

    const keyedInjectable = getInjectable({
      id: 'some-keyed-injectable',
      instantiate: () => 'irrelevant',
      lifecycle: lifecycleEnum.keyedSingleton({
        getInstanceKey: () => 'irrelevant',
      }),
    });

    const injectionToken = getInjectionToken({ id: 'some-injection-token' });

    const tokenInjectable = getInjectable({
      id: 'some-token-injectable',
      instantiate: () => 'irrelevant',
      injectionToken,
    });

    const syncSetuppable = getInjectable({
      id: 'some-sync-setuppable',
      instantiate: () => 'irrelevant',

      setup: di => {
        di.inject(syncChildInjectable);
        di.inject(syncSetuppable);
      },
    });

    const asyncSetuppable = getInjectable({
      id: 'some-async-setuppable',
      instantiate: () => 'irrelevant',

      setup: async di => {
        await di.inject(asyncChildInjectable);
      },
    });

    const di = getDi(
      parentInjectable,
      syncChildInjectable,
      asyncChildInjectable,
      tokenInjectable,
      syncSetuppable,
      asyncSetuppable,
      keyedInjectable,
    );

    registerDependencyGraphing(di);

    await di.runSetups();

    await di.inject(parentInjectable);

    const graph = di.inject(plantUmlDependencyGraphInjectable);

    expect(graph).toMatchSnapshot();
  });
});
