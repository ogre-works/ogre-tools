export const checkForSideEffectsFor =
  ({ getSideEffectsArePrevented, getNamespacedId }) =>
  injectable => {
    if (getSideEffectsArePrevented(injectable)) {
      throw new Error(
        `Tried to inject "${getNamespacedId(injectable)}" when side-effects are prevented.`,
      );
    }
  };
