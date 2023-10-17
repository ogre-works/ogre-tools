import isInjectionToken from '../getInjectionToken/isInjectionToken';

export const earlyOverrideFor =
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

    if (relatedInjectables.length === 0 && isInjectionToken(alias)) {
      throw new Error(
        `Tried to early-override an injection token "${alias.id}", but that is currently not supported.`,
      );
    }

    if (alreadyInjected.has(alias)) {
      throw new Error(
        `Tried to override injectable "${alias.id}", but it was already injected.`,
      );
    }

    const originalInjectable = relatedInjectables[0] || alias;

    overridingInjectables.set(originalInjectable, {
      ...originalInjectable,
      overriddenInjectable: originalInjectable,
      causesSideEffects: false,
      instantiate: instantiateStub,
    });
  };
