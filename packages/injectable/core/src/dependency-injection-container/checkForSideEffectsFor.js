export const checkForSideEffectsFor =
  ({ getSideEffectsArePrevented, getNamespacedId, getFromClause }) =>
  (injectable, injectingInjectable) => {
    if (getSideEffectsArePrevented(injectable)) {
      throw new Error(
        `Tried to inject "${getNamespacedId(injectable)}"${getFromClause(
          injectingInjectable,
        )} when side-effects are prevented.`,
      );
    }
  };
