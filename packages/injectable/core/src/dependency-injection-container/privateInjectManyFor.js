export const privateInjectManyFor =
  ({
    getRelatedInjectables,
    getInject,
    checkForAbstractToken,
    namespacedIdByInjectableMap,
  }) =>
  ({ withMeta }) =>
  ({ alias, instantiationParameters, injectingInjectable }) => {
    checkForAbstractToken(alias, injectingInjectable);

    const inject = getInject();

    const relatedInjectables = getRelatedInjectables(alias);
    const n = relatedInjectables.length;

    if (n === 0) {
      return [];
    }

    const result = new Array(n);

    if (withMeta) {
      for (let i = 0; i < n; i++) {
        const injectable = relatedInjectables[i];
        const instance = inject({
          alias: injectable,
          instantiationParameters,
          injectingInjectable: alias,
        });
        result[i] = {
          instance,
          meta: { id: namespacedIdByInjectableMap.get(injectable) },
        };
      }
    } else {
      for (let i = 0; i < n; i++) {
        result[i] = inject({
          alias: relatedInjectables[i],
          instantiationParameters,
          injectingInjectable: alias,
        });
      }
    }

    return result;
  };
