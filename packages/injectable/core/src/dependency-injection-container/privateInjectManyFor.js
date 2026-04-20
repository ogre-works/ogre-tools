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

    return relatedInjectables.map(injectable => {
      const instance = inject({
        alias: injectable,
        instantiationParameters,
        injectingInjectable: alias,
      });

      if (!withMeta) {
        return instance;
      }

      return {
        instance,
        meta: { id: namespacedIdByInjectableMap.get(injectable) },
      };
    });
  };
