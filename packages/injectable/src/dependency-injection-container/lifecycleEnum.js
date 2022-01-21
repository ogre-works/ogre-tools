import find from 'lodash/fp/find';
import get from 'lodash/fp/get';
import isUndefined from 'lodash/fp/isUndefined';
import { pipeline } from '@ogre-tools/fp';

const getInstance = ({
  di,
  injectable,
  instantiationParameter,
  context: oldContext,
}) => {
  if (!injectable.instantiate) {
    throw new Error(
      `Tried to inject "${injectable.id}" when instantiation is not defined.`,
    );
  }

  const newContext = [...oldContext, { id: injectable.id }];

  const injectableCausingCycle = pipeline(
    oldContext,
    find({ id: injectable.id }),
  );

  if (injectableCausingCycle && !injectableCausingCycle.setupping) {
    throw new Error(
      `Cycle of injectables encountered: "${newContext
        .map(get('id'))
        .join('" -> "')}"`,
    );
  }

  const minimalDi = {
    inject: (alias, parameter) => di.inject(alias, parameter, newContext),

    injectMany: (alias, parameter) =>
      di.injectMany(alias, parameter, newContext),
  };

  return injectable.instantiate(
    minimalDi,
    ...(isUndefined(instantiationParameter) ? [] : [instantiationParameter]),
  );
};

export default {
  singleton: {
    key: 'singleton',

    getInstance: ({
      injectable,
      instantiationParameter,
      di,
      instanceMap,
      context,
    }) => {
      if (instantiationParameter) {
        throw new Error(
          `Tried to inject singleton "${injectable.id}" with instantiation parameters.`,
        );
      }

      if (!instanceMap.has('singleton')) {
        instanceMap.set('singleton', new Map());
      }

      const singletonInstanceMap = instanceMap.get('singleton');

      const existingInstance = singletonInstanceMap.get(injectable);

      if (existingInstance) {
        return existingInstance;
      }

      const newInstance = getInstance({
        injectable,
        instantiationParameter,
        di,
        context,
      });

      singletonInstanceMap.set(injectable, newInstance);

      return newInstance;
    },

    purge: ({ injectable, instanceMap }) => {
      const singletonMap = instanceMap.get('singleton');

      return singletonMap.delete(injectable);
    },
  },

  transient: {
    key: 'transient',
    getInstance,

    purge: () => {
      throw new Error('Tried to purge injectable with transient lifecycle.');
    },
  },

  scopedTransient: getScope => ({
    key: 'scoped-transient',

    getInstance: ({
      di,
      injectable,
      instantiationParameter,
      instanceMap,
      context,
    }) => {
      const scope = getScope(di);

      if (!instanceMap.has('scoped-transient')) {
        instanceMap.set('scoped-transient', new Map());
      }

      const scopedTransientMap = instanceMap.get('scoped-transient');

      const scopesForInjectable =
        scopedTransientMap.get(injectable) || new Map();

      scopedTransientMap.set(injectable, scopesForInjectable);

      const existingInstance = scopesForInjectable.get(scope);

      if (existingInstance) {
        return existingInstance;
      }

      const newInstance = getInstance({
        injectable,
        instantiationParameter,
        di,
        context,
      });

      scopesForInjectable.clear();
      scopesForInjectable.set(scope, newInstance);

      return newInstance;
    },

    purge: ({ injectable, instanceMap }) => {
      const scopedTransientMap = instanceMap.get('scoped-transient');

      return scopedTransientMap.delete(injectable);
    },
  }),
};
