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
        if (parent.isChildOfSetup === true) {
          plantUmlState.add(
            `${camelCase(parent.id)} ..up* ${camelCase(dependency.id)} : Setup`,
          );

          return { ...dependency, isChildOfSetup: true };
        }

        if (parent.isSetup === true) {
          plantUmlState.add(
            `${camelCase(parent.id)} ..up* ${camelCase(dependency.id)} : Setup`,
          );

          return { ...dependency, isChildOfSetup: true };
        }

        plantUmlState.add(
          `${camelCase(parent.id)} --up* ${camelCase(dependency.id)}`,
        );
        return dependency;
      });

      context.forEach(contextItem => {
        if (contextItem.isInjectionToken) {
          plantUmlState.add(
            `class "${contextItem.id}" as ${camelCase(
              contextItem.id,
            )}<Token> #orange`,
          );
        } else if (contextItem.isSetup === true) {
          plantUmlState.add(
            `class "${contextItem.id}" as ${camelCase(contextItem.id)}<Setup>`,
          );
        } else {
          plantUmlState.add(
            `class "${contextItem.id}" as ${camelCase(contextItem.id)}<${
              contextItem.lifecycleName
            }>`,
          );
        }
      });
    };
  },

  decorable: false,

  injectionToken: injectionSpyInjectionToken,
});
