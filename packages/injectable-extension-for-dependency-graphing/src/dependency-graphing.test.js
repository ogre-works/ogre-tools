import {
  dependencyGraphCustomizerToken,
  plantUmlDependencyGraphInjectable,
  registerDependencyGraphing,
} from './dependency-graphing';

import isEqual from 'lodash/fp/isEqual';

import {
  createContainer,
  getInjectable,
  getInjectionToken,
  lifecycleEnum,
} from '@ogre-tools/injectable';

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
      instantiate: async di => {
        di.inject(customizableAsyncInjectable);

        return 'irrelevant';
      },
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

    const customizableSyncInjectable = getInjectable({
      id: 'some-customizable-sync-injectable',
      instantiate: () => 'some-customizable-instance',
      injectionToken,
    });

    const customizableAsyncInjectable = getInjectable({
      id: 'some-customizable-async-injectable',
      instantiate: async () => 'some-customizable-instance',
    });

    const graphCustomizer = getInjectable({
      id: 'some-dependency-graph-customizer',

      instantiate: () => ({
        shouldCustomize: isEqual('some-customizable-instance'),

        customizeLink: link => {
          link.infos.add('some-custom-link-info');
          link.lineColor = 'orange';
          link.textColor = 'green';
        },

        customizeNode: node => {
          node.infos.add('some-custom-node-info');
        },
      }),

      decorable: false,

      injectionToken: dependencyGraphCustomizerToken,
    });

    const di = createContainer('some-container');

    di.register(
      parentInjectable,
      syncChildInjectable,
      asyncChildInjectable,
      tokenInjectable,
      keyedInjectable,
      customizableSyncInjectable,
      customizableAsyncInjectable,
      graphCustomizer,
    );

    registerDependencyGraphing(di);

    await di.inject(parentInjectable);

    const graph = di.inject(plantUmlDependencyGraphInjectable);

    expect(graph).toMatchSnapshot();
  });
});
