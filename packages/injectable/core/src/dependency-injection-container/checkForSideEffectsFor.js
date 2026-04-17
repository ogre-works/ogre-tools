export const checkForSideEffectsFor =
  ({ getSideEffectsArePrevented, getNamespacedId }) =>
  (injectable, injectingInjectable) => {
    if (getSideEffectsArePrevented(injectable)) {
      throw new Error(
        `Tried to inject "${getNamespacedId(
          injectable,
        )}" from "${getNamespacedId(
          injectingInjectable,
        )}" when side-effects are prevented.`,
      );
    }
  };
