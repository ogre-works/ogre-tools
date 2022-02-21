import getInjectable from '../../../getInjectable/getInjectable';
import { injectionSpyInjectionToken } from '../../createContainer';
import lifecycleEnum from '../../lifecycleEnum';

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
        plantUmlState.add(`"${parent.id}" --up* "${dependency.id}"`);

        return dependency;
      });
    };
  },

  decorable: false,

  injectionToken: injectionSpyInjectionToken,
});
