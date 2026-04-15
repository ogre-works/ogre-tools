export const privateInjectManyFor =
  ({
    getRelatedInjectables,
    getInject,
    setDependee,
    getNamespacedId,
  }) =>
  ({ withMeta }) =>
  (injectionToken, instantiationParameter, source) => {
    setDependee(injectionToken, source);

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
