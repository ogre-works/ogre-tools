import isUndefined from 'lodash/fp/isUndefined';

const getInstance = ({ di, injectable, instantiationParameter }) => {
  if (!injectable.instantiate) {
    throw new Error(
      `Tried to inject "${injectable.id}" when instantiation is not defined.`,
    );
  }

  return injectable.instantiate(
    {
      inject: di.inject,
    },

    ...(isUndefined(instantiationParameter) ? [] : [instantiationParameter]),
  );
};

const iife = callback => callback();

export default {
  singleton: iife(() => {
    const singletonInstanceMap = new Map();

    return {
      key: 'singleton',

      getInstance: ({ injectable, instantiationParameter, di }) => {
        if (instantiationParameter) {
          throw new Error(
            `Tried to inject singleton "${injectable.id}" with instantiation parameters.`,
          );
        }

        const existingInstance = singletonInstanceMap.get(injectable);

        if (existingInstance) {
          return existingInstance;
        }

        const newInstance = getInstance({
          injectable,
          instantiationParameter,
          di,
        });

        singletonInstanceMap.set(injectable, newInstance);

        return newInstance;
      },

      purge: injectable => singletonInstanceMap.delete(injectable),
    };
  }),

  transient: {
    key: 'transient',
    getInstance,

    purge: () => {
      throw new Error('Tried to purge injectable with transient lifecycle.');
    },
  },

  scopedTransient: getScope =>
    iife(() => {
      const scopedTransientMap = new Map();

      return {
        key: 'scoped-transient',

        getInstance: ({ di, injectable, instantiationParameter }) => {
          const scope = getScope(di);

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
          });

          scopesForInjectable.clear();
          scopesForInjectable.set(scope, newInstance);

          return newInstance;
        },

        purge: injectable => scopedTransientMap.delete(injectable),
      };
    }),
};
