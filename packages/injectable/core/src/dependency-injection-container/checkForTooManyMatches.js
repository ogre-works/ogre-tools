export const checkForTooManyMatchesFor =
  ({ getNamespacedId }) =>
  (relatedInjectables, alias, injectingInjectable) => {
    if (relatedInjectables.length > 1) {
      throw new Error(
        `Tried to inject single injectable for injection token "${
          alias.id
        }" from "${getNamespacedId(
          injectingInjectable,
        )}" but found multiple injectables: "${relatedInjectables
          .map(getNamespacedId)
          .join('", "')}"`,
      );
    }
  };
