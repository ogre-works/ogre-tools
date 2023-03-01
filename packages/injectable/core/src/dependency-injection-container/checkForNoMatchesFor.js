export const checkForNoMatchesFor =
  getNamespacedId => (relatedInjectables, alias, context) => {
    if (relatedInjectables.length === 0) {
      const errorContextString = [...context, { injectable: { id: alias.id } }]
        .map(({ injectable }) => getNamespacedId(injectable))
        .join('" -> "');

      throw new Error(
        `Tried to inject non-registered injectable "${errorContextString}".`,
      );
    }
  };
