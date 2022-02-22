import getInjectable from '../../../getInjectable/getInjectable';
import { injectionSpyInjectionToken } from '../../createContainer';
import lifecycleEnum from '../../lifecycleEnum';
import camelCase from 'lodash/fp/camelCase';

export const registerDependencyGraphing = di => {
  di.register(plantUmlDependencyGraphInjectable);
  di.register(plantUmlStateInjectable);
  di.register(plantUmlExtractorInjectable);
};

export const plantUmlDependencyGraphInjectable = getInjectable({
  id: 'plant-uml-dependency-graph',

  lifecycle: lifecycleEnum.transient,

  instantiate: di => {
    const plantUmlState = di.inject(plantUmlStateInjectable);

    return [
      '@startuml',
      'hide members',
      'hide circle',
      ...[...plantUmlState.nodes.values()].map(
        x => `${x.puml}${[...x.tags].map(x => ` $${x}`).join('')}`,
      ),
      ...plantUmlState.links,
      '@enduml',
    ].join('\n');
  },

  decorable: false,
});

const plantUmlStateInjectable = getInjectable({
  id: 'plant-uml-state',

  instantiate: () => ({
    nodes: new Map(),
    links: new Set(),
  }),

  decorable: false,
});

const plantUmlExtractorInjectable = getInjectable({
  id: 'plant-uml-extractor',

  instantiate: di => {
    const plantUmlState = di.inject(plantUmlStateInjectable);

    return ({ context }) => {
      context.forEach(contextItem => {
        const injectableName = contextItem.injectable.id;
        const injectableId = camelCase(injectableName);

        if (!plantUmlState.nodes.has(injectableId)) {
          if (contextItem.isInjectionToken) {
            plantUmlState.nodes.set(injectableId, {
              puml: `class "${injectableName}" as ${injectableId}<Token>`,
              tags: new Set([injectableName]),
            });
          } else {
            plantUmlState.nodes.set(injectableId, {
              puml: `class "${injectableName}" as ${injectableId}<${contextItem.injectable.lifecycle.name}>`,
              tags: new Set([injectableName]),
            });
          }
        }
      });

      context.reduce((parent, dependency) => {
        const parentId = camelCase(parent.injectable.id);
        const dependencyId = camelCase(dependency.injectable.id);

        const descendantOf = [
          ...(parent.descendantOf || []),
          parent.injectable.id,
        ];
        const dependencyTags = plantUmlState.nodes.get(dependencyId).tags;
        descendantOf.forEach(x => dependencyTags.add(x));

        if (parent.descendantOfSetup === true) {
          plantUmlState.links.add(`${parentId} ..up* ${dependencyId} : Setup`);

          return {
            ...dependency,
            descendantOfSetup: true,
            descendantOf,
          };
        }

        if (parent.isSetup === true) {
          plantUmlState.links.add(`${parentId} ..up* ${dependencyId} : Setup`);

          return {
            ...dependency,
            descendantOfSetup: true,
            descendantOf,
          };
        }

        plantUmlState.links.add(`${parentId} --up* ${dependencyId}`);

        return {
          ...dependency,
          descendantOf,
        };
      });
    };
  },

  decorable: false,

  injectionToken: injectionSpyInjectionToken,
});
