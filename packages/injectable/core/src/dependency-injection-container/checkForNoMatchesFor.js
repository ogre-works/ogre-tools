export const checkForNoMatchesFor =
  ({ namespacedIdByInjectableMap }) =>
  (relatedInjectables, alias, injectingInjectable) => {
    if (relatedInjectables.length === 0) {
      const injectorId = namespacedIdByInjectableMap.get(injectingInjectable);
      const fromClause = injectorId ? ` from "${injectorId}"` : '';

      throw new Error(
        `Tried to inject non-registered injectable "${alias.id}"${fromClause}.`,
      );
    }
  };
