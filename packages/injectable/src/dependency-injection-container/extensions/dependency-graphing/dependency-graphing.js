import getInjectable from '../../../getInjectable/getInjectable';
import { injectionDecoratorToken } from '../../createContainer';
import lifecycleEnum from '../../lifecycleEnum';
import camelCase from 'lodash/fp/camelCase';
import { injectionTokenSymbol } from '../../../getInjectionToken/getInjectionToken';
import last from 'lodash/fp/last';
import get from 'lodash/fp/get';
import some from 'lodash/fp/some';
import { isPromise, pipeline } from '@ogre-tools/fp';

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

  instantiate: di => ({
    decorate: toBeDecorated => (alias, instantiationParameter, context) => {
      const instance = toBeDecorated(alias, instantiationParameter, context);

      const graphState = di.inject(dependencyGraphStateInjectable);
      const injectableName = alias.id;
      const injectableId = camelCase(injectableName);

      if (!graphState.nodes.has(injectableId)) {
        graphState.nodes.set(injectableId, {
          id: injectableId,
          name: injectableName,
          tags: new Set([injectableName]),
          infos: new Set(),
        });
      }

      const node = graphState.nodes.get(injectableId);

      if (alias.aliasType === injectionTokenSymbol) {
        node.isInjectionToken = true;
        node.lifecycle = tokenLifecycle;
        node.infos.add('Token');
      } else {
        node.lifecycle = alias.lifecycle;
      }

      const instanceIsAsync = isPromise(instance);

      if (instanceIsAsync) {
        node.isAsync = true;
        node.infos.add('Async');
      }

      const parentContext = last(context);

      if (parentContext) {
        const parentId = camelCase(parentContext.injectable.id);
        const dependencyId = camelCase(alias.id);

        const linkIsRelatedToSetup = pipeline(context, some('isSetup'));

        const linkId = `${parentId}/${dependencyId}:${
          linkIsRelatedToSetup ? 'setup' : 'not-setup'
        }`;

        const descendantIds = context.map(get('injectable.id'));
        const node = graphState.nodes.get(dependencyId);
        descendantIds.forEach(descendantId => node.tags.add(descendantId));

        if (!graphState.links.has(linkId)) {
          graphState.links.set(linkId, {
            parentId,
            dependencyId,
            infos: new Set(),
          });
        }

        const link = graphState.links.get(linkId);

        if (linkIsRelatedToSetup) {
          link.isRelatedToSetup = true;
          link.infos.add('Setup');
          node.tags.add('setup');
        }

        if (instanceIsAsync) {
          link.isAsync = true;
          link.infos.add('Async');
        }
      }

      return instance;
    },
  }),

  decorable: false,

  injectionToken: injectionDecoratorToken,
});

const toPlantUmlNode = ({
  id,
  name,
  lifecycle,
  tags,
  isInjectionToken,
  infos,
}) => {
  const infosString = [lifecycle.name, ...infos.values()].join('\\n');
  const classPuml = `class "${name}" as ${id}<${infosString}>`;
  const spotPuml = `<< (${lifecycle.shortName},${lifecycle.color}) >>`;
  const tagPuml = [...tags].map(tag => `$${tag}`).join(' ');
  const borderColor = isInjectionToken ? 'green' : 'darkRed';
  const stylePuml = `#line:${borderColor}`;

  return `${classPuml} ${spotPuml} ${tagPuml} ${stylePuml}`;
};

const toPlantUmlLink = ({
  parentId,
  dependencyId,
  isRelatedToSetup,
  isAsync,
  infos,
}) => {
  const lineColor = 'black';
  const lineType = isRelatedToSetup ? 'dashed' : 'plain';
  const lineThickness = isAsync ? 4 : 1;

  const lineStyle = `[#${lineColor},${lineType},thickness=${lineThickness}]`;

  const infosString = infos.size ? ` : ${[...infos.values()].join('\\n')}` : '';

  return `${parentId} --${lineStyle}up* ${dependencyId}${infosString}`;
};

const tokenLifecycle = {
  name: 'Transient',
  shortName: 'X',
  color: 'orange',
};
