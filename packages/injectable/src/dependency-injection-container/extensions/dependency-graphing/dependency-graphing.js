import getInjectable from '../../../getInjectable/getInjectable';
import { injectionSpyInjectionToken } from '../../createContainer';
import lifecycleEnum from '../../lifecycleEnum';
import camelCase from 'lodash/fp/camelCase';
import getOr from 'lodash/fp/getOr';

export const registerDependencyGraphing = di => {
  di.register(plantUmlDependencyGraphInjectable);
  di.register(dependencyGraphStateInjectable);
  di.register(plantUmlExtractorInjectable);
};

export const plantUmlDependencyGraphInjectable = getInjectable({
  id: 'plant-uml-dependency-graph',

  lifecycle: lifecycleEnum.transient,

  instantiate: di => {
    const { nodes, links } = di.inject(dependencyGraphStateInjectable);

    return [
      '@startuml',
      'hide members',
      'hide circle',
      ...[...nodes.values()].map(toPlantUmlNode),
      ...[...links.values()].map(toPlantUmlLink),
      '@enduml',
    ].join('\n');
  },

  decorable: false,
});

const dependencyGraphStateInjectable = getInjectable({
  id: 'dependency-graph-state',

  instantiate: () => ({
    nodes: new Map(),
    links: new Map(),
  }),

  decorable: false,
});

const plantUmlExtractorInjectable = getInjectable({
  id: 'plant-uml-extractor',

  instantiate: di => {
    const plantUmlState = di.inject(dependencyGraphStateInjectable);

    return ({ context }) => {
      context.forEach(contextItem => {
        const injectableName = contextItem.injectable.id;
        const injectableId = camelCase(injectableName);

        if (!plantUmlState.nodes.has(injectableId)) {
          plantUmlState.nodes.set(injectableId, {
            id: injectableId,
            name: injectableName,
            lifecycleName: getOr(
              null,
              'injectable.lifecycle.name',
              contextItem,
            ),
            tags: new Set([injectableName]),
          });
        }

        const node = plantUmlState.nodes.get(injectableId);

        if (contextItem.isInjectionToken) {
          node.isInjectionToken = true;
        }
      });

      context.reduce((parent, dependency) => {
        const parentId = camelCase(parent.injectable.id);
        const dependencyId = camelCase(dependency.injectable.id);

        const linkIsRelatedToSetup =
          parent.isSetup || parent.descendantOfSetup === true;

        const linkId = `${parentId}/${dependencyId}:${
          linkIsRelatedToSetup ? 'setup' : 'not-setup'
        }`;

        const descendantOf = [
          ...(parent.descendantOf || []),
          parent.injectable.id,
        ];

        const node = plantUmlState.nodes.get(dependencyId);
        descendantOf.forEach(ancestorId => node.tags.add(ancestorId));

        if (!plantUmlState.links.has(linkId)) {
          plantUmlState.links.set(linkId, {
            parentId,
            dependencyId,
          });
        }

        const link = plantUmlState.links.get(linkId);

        if (linkIsRelatedToSetup) {
          link.setup = true;

          node.tags.add('setup');

          return {
            ...dependency,
            descendantOfSetup: true,
            descendantOf,
          };
        }

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

const toPlantUmlNode = ({
  id,
  name,
  lifecycleName,
  tags,
  isInjectionToken,
}) => {
  const mainPuml = isInjectionToken
    ? `class "${name}" as ${id}<Token>`
    : `class "${name}" as ${id}<${lifecycleName}>`;

  const tagPuml = [...tags].map(tag => ` $${tag}`).join('');

  return mainPuml + tagPuml;
};

const toPlantUmlLink = ({ parentId, dependencyId, setup }) =>
  setup
    ? `${parentId} ..up* ${dependencyId} : Setup`
    : `${parentId} --up* ${dependencyId}`;
