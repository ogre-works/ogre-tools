import isInjectable from '../getInjectable/isInjectable';
import { injectableSymbol2 } from '../getInjectable2/getInjectable2';

// Declared sets are derived once per injectable: a `consumptions` array is
// fixed at creation, and injectable identity outlives any single container.
const declaredSetsByInjectable = new WeakMap();

const getDeclaredSet = injectable => {
  let declared = declaredSetsByInjectable.get(injectable);

  if (!declared) {
    declared = new Set(injectable.consumptions ?? []);
    declaredSetsByInjectable.set(injectable, declared);
  }

  return declared;
};

export const checkForUndeclaredConsumptionFor =
  ({ getNamespacedId }) =>
  ({ alias, injectingInjectable }) => {
    // Only injectable2 declares consumptions. Everything else is exempt by
    // this one check: the container root, v1 injectables, and the token that
    // stands in as the injecting party for injectMany's element injects.
    if (injectingInjectable.aliasType !== injectableSymbol2) {
      return;
    }

    // Injecting an injectable by reference already implies a dependency on
    // whatever package it lives in, so only tokens are declared.
    if (isInjectable(alias)) {
      return;
    }

    const declared = getDeclaredSet(injectingInjectable);

    // Declaring a general token covers every `.for()` derivative of it, which
    // is what makes runtime specifiers declarable at all. The walk is upwards
    // only: declaring a specific token does not cover its general token.
    let candidate = alias;

    while (candidate !== undefined) {
      if (declared.has(candidate)) {
        return;
      }

      candidate = candidate.specificTokenOf;
    }

    throw new Error(
      `Tried to inject "${alias.id}" from "${getNamespacedId(
        injectingInjectable,
      )}", but it is not a declared consumption.`,
    );
  };
