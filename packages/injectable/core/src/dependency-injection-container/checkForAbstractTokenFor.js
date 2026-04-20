export const checkForAbstractTokenFor =
  ({ getNamespacedId }) =>
  (alias, injectingInjectable) => {
    if (alias.abstract) {
      throw new Error(
        `Tried to inject injection token "${alias.id}" from "${getNamespacedId(injectingInjectable)}", but it is abstract. Use ".for(specifier)" for a concrete token.`,
      );
    }
  };
