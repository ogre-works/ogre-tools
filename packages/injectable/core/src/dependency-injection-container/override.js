export const overrideFor =
  ({ getRelatedInjectables, alreadyInjected, overridingInjectables }) =>
  (alias, instantiateStub) => {
    const relatedInjectables = getRelatedInjectables(alias);

    if (relatedInjectables.length > 1) {
      throw new Error(
        `Tried to override single implementation of injection token "${
          alias.id
        }", but found multiple registered implementations: "${relatedInjectables
          .map(x => x.id)
          .join('", "')}".`,
      );
    }

    if (relatedInjectables.length === 0) {
      if (alias.aliasType === 'injection-token') {
        throw new Error(
          `Tried to override single implementation of injection token "${alias.id}", but found no registered implementations.`,
        );
      }

      throw new Error(
        `Tried to override "${alias.id}" which is not registered.`,
      );
    }

    if (alreadyInjected.has(alias.id)) {
      throw new Error(
        `Tried to override injectable "${alias.id}", but it was already injected.`,
      );
    }

    const originalInjectable = relatedInjectables[0];

    overridingInjectables.set(originalInjectable.id, {
      ...originalInjectable,
      causesSideEffects: false,
      instantiate: instantiateStub,
    });
  };

export const unoverrideFor =
  ({ overridingInjectables }) =>
  alias => {
    overridingInjectables.delete(alias.id);
  };
