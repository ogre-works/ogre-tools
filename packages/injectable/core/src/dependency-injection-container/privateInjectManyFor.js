export const privateInjectManyFor =
  ({ getRelatedInjectables, getInject, namespacedIdByInjectableMap }) =>
  ({ withMeta }) =>
  (injectionToken, instantiationParameter, injectingInjectable) => {
    const inject = getInject();

    const relatedInjectables = getRelatedInjectables(injectionToken);

    return relatedInjectables.map(injectable => {
      const instance = inject(
        injectable,
        instantiationParameter,
        injectionToken,
      );

      if (!withMeta) {
        return instance;
      }

      return {
        instance,
        meta: { id: namespacedIdByInjectableMap.get(injectable) },
      };
    });
  };
