export const checkForNoMatchesFor =
  ({ getFromClause }) =>
  (relatedInjectables, alias, injectingInjectable) => {
    if (relatedInjectables.length === 0) {
      throw new Error(
        `Tried to inject non-registered injectable "${
          alias.id
        }"${getFromClause(injectingInjectable)}.`,
      );
    }
  };
