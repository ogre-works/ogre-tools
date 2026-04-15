export const privateInjectManyFor =
  ({
    getRelatedInjectables,
    getInject,
    getNamespacedId,
  }) =>
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

      const namespacedId = getNamespacedId(injectable);

      return {
        instance,
        meta: { id: namespacedId },
      };
    });
  };
