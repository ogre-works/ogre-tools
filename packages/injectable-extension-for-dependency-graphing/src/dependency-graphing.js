import camelCase from 'lodash/fp/camelCase';
import last from 'lodash/fp/last';
import get from 'lodash/fp/get';
import filter from 'lodash/fp/filter';
import tap from 'lodash/fp/tap';

import {
  getInjectable,
  getInjectionToken,
  injectionDecoratorToken,
  isInjectionToken,
  lifecycleEnum,
} from '@ogre-tools/injectable';

import { isPromise, pipeline } from '@ogre-tools/fp';
import lifecycleEnumForDependencyGraphing from './lifecycleEnumForDependencyGraphing';

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

export const dependencyGraphCustomizerToken = getInjectionToken({
  id: 'dependency-graph-customizer',
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

      if (isInjectionToken(alias)) {
        node.isInjectionToken = true;
        node.lifecycle = lifecycleEnumForDependencyGraphing.injectionToken;
        node.infos.add('Token');
      } else {
        node.lifecycle = lifecycleEnumForDependencyGraphing[alias.lifecycle.id];
      }

      const instanceIsAsync = isPromise(instance);

      if (instanceIsAsync) {
        node.isAsync = true;
        node.infos.add('Async');
      }

      const parentContext = last(context);
      let link;

      const parentId = camelCase(parentContext.injectable.id);
      const dependencyId = camelCase(alias.id);

      const linkId = `${parentId}/${dependencyId}`;

      const descendantIds = context.map(get('injectable.id'));
      const dependencyNode = graphState.nodes.get(dependencyId);
      descendantIds.forEach(descendantId =>
        dependencyNode.tags.add(descendantId),
      );

      if (!graphState.links.has(linkId)) {
        graphState.links.set(linkId, {
          parentId,
          dependencyId,
          infos: new Set(),
        });
      }

      link = graphState.links.get(linkId);

      if (instanceIsAsync) {
        link.isAsync = true;
        link.infos.add('Async');
      }

      return pipeline(instance, tap(customizeFor(di, node, link)));
    },
  }),

  decorable: false,

  injectionToken: injectionDecoratorToken,
});

const customizeFor = (di, node, link) => instance => {
  const customizers = pipeline(
    di.injectMany(dependencyGraphCustomizerToken),
    filter(customizer => customizer.shouldCustomize(instance)),
  );

  customizers.forEach(customizer => customizer.customizeNode(node));

  customizers.forEach(customizer => customizer.customizeLink(link));
};

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
  isAsync,
  infos,
  lineColor = 'black',
  textColor = 'black',
}) => {
  const lineType = 'plain';
  const lineThickness = isAsync ? 4 : 1;
  const lineStyle = `[#${lineColor},${lineType},thickness=${lineThickness}]`;
  const infosString = infos.size ? ` : ${[...infos.values()].join('\\n')}` : '';

  return `${parentId} --${lineStyle}up* ${dependencyId} #text:${textColor} ${infosString} `;
};
