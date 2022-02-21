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

  instantiate: di =>
    [
      '@startuml',
      'hide members',
      'hide circle',
      ...di.inject(plantUmlStateInjectable).values(),
      '@enduml',
    ].join('\n'),

  decorable: false,
});

const plantUmlStateInjectable = getInjectable({
  id: 'plant-uml-state',
  instantiate: () => new Set(),
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
          plantUmlState.add(`${parentId} ..up* ${dependencyId} : Setup`);

          return { ...dependency, isChildOfSetup: true };
        }

        if (parent.isSetup === true) {
          plantUmlState.add(`${parentId} ..up* ${dependencyId} : Setup`);

          return { ...dependency, isChildOfSetup: true };
        }

        plantUmlState.add(`${parentId} --up* ${dependencyId}`);

        return dependency;
      });

      context.forEach(contextItem => {
        const injetableName = contextItem.injectable.id;
        const injectableId = camelCase(injetableName);

        if (contextItem.isInjectionToken) {
          plantUmlState.add(
            `class "${injetableName}" as ${injectableId}<Token> #orange`,
          );
        } else if (contextItem.isSetup === true) {
          plantUmlState.add(
            `class "${injetableName}" as ${injectableId}<Setup>`,
          );
        } else {
          plantUmlState.add(
            `class "${injetableName}" as ${injectableId}<${contextItem.injectable.lifecycle.name}>`,
          );
        }
      });
    };
  },

  decorable: false,

  injectionToken: injectionSpyInjectionToken,
});
