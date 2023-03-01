export const checkForSideEffectsFor =
  ({ getSideEffectsArePrevented, getNamespacedId }) =>
  (injectable, context) => {
    if (getSideEffectsArePrevented(injectable)) {
      throw new Error(
        `Tried to inject "${[...context, { injectable }]
          .map(({ injectable }) => getNamespacedId(injectable))
          .join('" -> "')}" when side-effects are prevented.`,
      );
    }
  };
