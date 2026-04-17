export const checkForTooManyMatchesFor =
  ({ getNamespacedId, getFromClause }) =>
  (relatedInjectables, alias, injectingInjectable) => {
    if (relatedInjectables.length > 1) {
      throw new Error(
        `Tried to inject single injectable for injection token "${
          alias.id
        }"${getFromClause(
          injectingInjectable,
        )} but found multiple injectables: "${relatedInjectables
          .map(getNamespacedId)
          .join('", "')}"`,
      );
    }
  };
