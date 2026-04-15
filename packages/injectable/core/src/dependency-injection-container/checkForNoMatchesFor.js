export const checkForNoMatches = (relatedInjectables, alias) => {
  if (relatedInjectables.length === 0) {
    throw new Error(
      `Tried to inject non-registered injectable "${alias.id}".`,
    );
  }
};
