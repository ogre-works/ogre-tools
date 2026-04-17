export const checkForTooManyMatchesFor =
  ({ getNamespacedId, namespacedIdByInjectableMap }) =>
  (relatedInjectables, alias, injectingInjectable) => {
    if (relatedInjectables.length > 1) {
      const injectorId = namespacedIdByInjectableMap.get(injectingInjectable);
      const fromClause = injectorId ? ` from "${injectorId}"` : '';

      throw new Error(
        `Tried to inject single injectable for injection token "${
          alias.id
        }"${fromClause} but found multiple injectables: "${relatedInjectables
          .map(getNamespacedId)
          .join('", "')}"`,
      );
    }
  };
