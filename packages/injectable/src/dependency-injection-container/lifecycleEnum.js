import { mapValuesDeep, pipeline } from '../../../fp/src/index';
import identity from 'lodash/fp/identity';

const getInstance = ({ di, injectable, instantiationParameter }) => {
  if (!injectable.instantiate && !injectable.Model) {
    throw new Error(
      `Tried to inject "${injectable.id}" when instantiation is not defined.`,
    );
  }

  if (injectable.getDependencies) {
    return pipeline(
      injectable.getDependencies(di, instantiationParameter),
      synchronize,
      syncDependencies =>
        injectable.Model
          ? new injectable.Model(syncDependencies, instantiationParameter)
          : injectable.instantiate(syncDependencies, instantiationParameter),
    );
  }

  return injectable.Model
    ? new injectable.Model(instantiationParameter)
    : injectable.instantiate(di, instantiationParameter);
};

export default {
  singleton: {
    getInstance: ({
      injectable,
      instantiationParameter,
      di,
      singletonInstanceMap,
    }) => {
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
  },

  transient: {
    getInstance,
  },

  scopedTransient: getScope => ({
    getInstance: ({
      di,
      injectable,
      instantiationParameter,
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
      });

      scopesForInjectable.clear();
      scopesForInjectable.set(scope, newInstance);

      return newInstance;
    },
  }),
};

const synchronize = mapValuesDeep(identity);
