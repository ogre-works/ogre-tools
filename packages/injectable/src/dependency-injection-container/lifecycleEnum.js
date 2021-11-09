import { mapValuesDeep, pipeline } from '../../../fp/src/index';
import identity from 'lodash/fp/identity';

const getInstance = ({
  di,
  injectable,
  instantiationParameter,
  instantiationDecorator,
}) => {
  if (!injectable.instantiate && !injectable.Model) {
    throw new Error(
      `Tried to inject "${injectable.id}" when instantiation is not defined.`,
    );
  }

  if (injectable.getDependencies) {
    return pipeline(
      injectable.getDependencies(di, instantiationParameter),
      synchronize,
      (syncDependencies) =>
        injectable.Model
          ? new injectable.Model(syncDependencies, instantiationParameter)
          : instantiationDecorator(injectable.instantiate)(
              syncDependencies,
              instantiationParameter,
            ),
    );
  }

  return injectable.Model
    ? new injectable.Model(instantiationParameter)
    : instantiationDecorator(injectable.instantiate)(
        di,
        instantiationParameter,
      );
};

export default {
  singleton: {
    getInstance: ({
      injectable,
      instantiationDecorator,
      instantiationParameter,
      di,
      singletonInstanceMap,
    }) => {
      const existingInstance = singletonInstanceMap.get(injectable);

      if (existingInstance) {
        return existingInstance;
      }

      const newInstance = getInstance({
        injectable,
        instantiationParameter,
        di,
        instantiationDecorator,
      });

      singletonInstanceMap.set(injectable, newInstance);

      return newInstance;
    },
  },

  transient: {
    getInstance,
  },

  scopedTransient: (getScope) => ({
    getInstance: ({
      di,
      injectable,
      instantiationParameter,
      instantiationDecorator,
      scopedTransientMap,
    }) => {
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
        instantiationDecorator,
      });

      scopesForInjectable.clear();
      scopesForInjectable.set(scope, newInstance);

      return newInstance;
    },
  }),
};

const synchronize = mapValuesDeep(identity);
