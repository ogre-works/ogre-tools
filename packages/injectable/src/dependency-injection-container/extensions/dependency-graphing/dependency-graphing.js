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
      ...plantUmlState.nodes,
      ...plantUmlState.links,
      '@enduml',
    ].join('\n');
  },

  decorable: false,
});

const plantUmlStateInjectable = getInjectable({
  id: 'plant-uml-state',

  instantiate: () => ({
    nodes: new Set(),
    links: new Set(),
  }),

  decorable: false,
});

const plantUmlExtractorInjectable = getInjectable({
  id: 'plant-uml-extractor',

  instantiate: di => {
    const plantUmlState = di.inject(plantUmlStateInjectable);

    return ({ context }) => {
      context.reduce((parent, dependency) => {
        const parentId = camelCase(parent.injectable.id);
        const dependencyId = camelCase(dependency.injectable.id);

        if (parent.isChildOfSetup === true) {
          plantUmlState.links.add(`${parentId} ..up* ${dependencyId} : Setup`);

          return { ...dependency, isChildOfSetup: true };
        }

        if (parent.isSetup === true) {
          plantUmlState.links.add(`${parentId} ..up* ${dependencyId} : Setup`);

          return { ...dependency, isChildOfSetup: true };
        }

        plantUmlState.links.add(`${parentId} --up* ${dependencyId}`);

        return dependency;
      });

      context.forEach(contextItem => {
        const injetableName = contextItem.injectable.id;
        const injectableId = camelCase(injetableName);

        if (contextItem.isInjectionToken) {
          plantUmlState.nodes.add(
            `class "${injetableName}" as ${injectableId}<Token> #orange`,
          );
        } else {
          plantUmlState.nodes.add(
            `class "${injetableName}" as ${injectableId}<${contextItem.injectable.lifecycle.name}>`,
          );
        }
      });
    };
  },

  decorable: false,

  injectionToken: injectionSpyInjectionToken,
});
