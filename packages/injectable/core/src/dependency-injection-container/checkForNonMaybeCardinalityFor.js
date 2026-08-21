export const checkForNonMaybeCardinalityFor =
  ({ getNamespacedId }) =>
  (alias, injectingInjectable) => {
    if (alias.cardinality !== 'zero-or-one') {
      throw new Error(
        `Tried to injectMaybe "${alias.id}" from "${getNamespacedId(
          injectingInjectable,
        )}", but its cardinality is "${
          alias.cardinality
        }" instead of "zero-or-one".`,
      );
    }
  };
