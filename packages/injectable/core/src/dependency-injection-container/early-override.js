import isInjectionToken from '../getInjectionToken/isInjectionToken';
import { injectableSymbol2 } from '../getInjectable2/getInjectable2';
import { injectionTokenSymbol2 } from '../getInjectionToken2/getInjectionToken2';

const targetIsV2 = injectable =>
  injectable.aliasType === injectableSymbol2 ||
  injectable.aliasType === injectionTokenSymbol2;

// v1-shape stub: (di, ...params) => instance. Wraps for v2 targets.
const asV1Shape = (stub, isV2Target) =>
  isV2Target
    ? di =>
        (...params) =>
          stub(di, ...params)
    : stub;

// v2-shape stub: (di) => (...params) => instance. Unwraps for v1 targets.
const asV2Shape = (stub, isV2Target) =>
  isV2Target
    ? stub
    : (di, ...params) => stub(di)(...params);

const earlyOverrideImplFor = normalize =>
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

    overridingInjectables.set(originalInjectable, {
      ...originalInjectable,
      overriddenInjectable: originalInjectable,
      causesSideEffects: false,
      instantiate: normalize(instantiateStub, targetIsV2(originalInjectable)),
    });
  };

export const earlyOverrideFor = earlyOverrideImplFor(asV1Shape);
export const earlyOverride2For = earlyOverrideImplFor(asV2Shape);
