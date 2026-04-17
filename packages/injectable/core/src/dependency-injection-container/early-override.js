import isInjectionToken from '../getInjectionToken/isInjectionToken';
import { injectableSymbol2 } from '../getInjectable2/getInjectable2';

export const earlyOverrideFor =
  ({
    getRelatedInjectables,
    alreadyInjected,
    overridingInjectables,
    getNamespacedId,
  }) =>
  (alias, instantiateStub) => {
    const relatedInjectables = getRelatedInjectables(alias);

    if (relatedInjectables.length > 1) {
      throw new Error(
        `Tried to override single implementation of injection token "${
          alias.id
        }", but found multiple registered implementations: "${relatedInjectables
          .map(getNamespacedId)
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
        `Tried to override injectable "${getNamespacedId(
          alias,
        )}", but it was already injected.`,
      );
    }

    const originalInjectable = relatedInjectables[0] || alias;

    // For injectable2, wrap the stub to match the curried pattern.
    // This allows users to override with flat (di, ...args) => result stubs
    // even when the underlying injectable uses (di) => (...args) => result.
    const wrappedInstantiate =
      originalInjectable.aliasType === injectableSymbol2
        ? di =>
            (...args) =>
              instantiateStub(di, ...args)
        : instantiateStub;

    overridingInjectables.set(originalInjectable, {
      ...originalInjectable,
      overriddenInjectable: originalInjectable,
      causesSideEffects: false,
      instantiate: wrappedInstantiate,
    });
  };
