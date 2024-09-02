export const privateInjectManyFor =
  ({
    containerRootContextItem,
    getRelatedInjectables,
    getInject,
    setDependee,
    getNamespacedId,
  }) =>
  ({ withMeta }) =>
  (
    injectionToken,
    instantiationParameter,
    oldContext = [containerRootContextItem],
    source,
  ) => {
    setDependee({ dependency: injectionToken, dependee: source });

    const inject = getInject();

    const newContext = [...oldContext, { injectable: injectionToken }];

    const relatedInjectables = getRelatedInjectables(injectionToken);

    return relatedInjectables.map(injectable => {
      const instance = inject(
        injectable,
        instantiationParameter,
        newContext,
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
