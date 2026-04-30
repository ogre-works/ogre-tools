export const privateInjectManyFor =
  ({ getRelatedInjectables, getInject, namespacedIdByInjectableMap }) =>
  ({ withMeta }) =>
  ({ alias, instantiationParameters, injectingInjectable }) => {
    const inject = getInject();

    const relatedInjectables = getRelatedInjectables(alias);
    const n = relatedInjectables.length;

    if (n === 0) {
      return [];
    }

    const result = new Array(n);

    // The arg object is reused across iterations — privateInjectFor
    // destructures it on entry and never retains a reference, so mutating
    // .alias between calls is safe.
    const arg = {
      alias: undefined,
      instantiationParameters,
      injectingInjectable: alias,
    };

    if (withMeta) {
      for (let i = 0; i < n; i++) {
        const injectable = relatedInjectables[i];
        arg.alias = injectable;
        const instance = inject(arg);
        result[i] = {
          instance,
          meta: { id: namespacedIdByInjectableMap.get(injectable) },
        };
      }
    } else {
      for (let i = 0; i < n; i++) {
        arg.alias = relatedInjectables[i];
        result[i] = inject(arg);
      }
    }

    return result;
  };
