export const checkForTooManyMatchesFor =
  ({ getNamespacedId }) =>
  (relatedInjectables, alias) => {
    if (relatedInjectables.length > 1) {
      throw new Error(
        `Tried to inject single injectable for injection token "${
          alias.id
        }" but found multiple injectables: "${relatedInjectables
          .map(getNamespacedId)
          .join('", "')}"`,
      );
    }
  };
