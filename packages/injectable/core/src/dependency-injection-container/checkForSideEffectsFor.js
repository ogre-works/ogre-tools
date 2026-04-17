export const checkForSideEffectsFor =
  ({
    getSideEffectsArePrevented,
    getNamespacedId,
    namespacedIdByInjectableMap,
  }) =>
  (injectable, injectingInjectable) => {
    if (getSideEffectsArePrevented(injectable)) {
      const injectorId = namespacedIdByInjectableMap.get(injectingInjectable);
      const fromClause = injectorId ? ` from "${injectorId}"` : '';

      throw new Error(
        `Tried to inject "${getNamespacedId(
          injectable,
        )}"${fromClause} when side-effects are prevented.`,
      );
    }
  };
