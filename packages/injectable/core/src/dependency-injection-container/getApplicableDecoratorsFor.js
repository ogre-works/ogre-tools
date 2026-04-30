import { getRelatedTokens } from './getRelatedTokens';

// Returns every decorator/callback instance that applies to `target` for the
// given `decoratorToken`. Three lookup dimensions are unified:
//
//   1. Direct:   decoratorToken.for(target).
//   2. Chain:    walk `specificTokenOf` ancestors of the contract token —
//                `target.injectionToken` for injectable targets,
//                `target.specificTokenOf` for token targets — and look up
//                `decoratorToken.for(ancestor)` for each. This is symmetric
//                with the registration-time chain indexing in
//                `getRelatedTokens`: a contributor registered under
//                `someToken.for(specifier)` is already retrievable via
//                `injectMany(someToken)`, and a decorator targeting the
//                parent contract should fire for the child specialization.
//   3. Tags:     for every string in `target.tags`, look up
//                `decoratorToken.for(tag)`.
//
// Token targets naturally skip the tag dimension (tokens don't carry tags).
// Injectables without an `injectionToken` skip the chain dimension.
//
// Fast path: if no injectable is registered under the abstract `decoratorToken`
// itself, none of the three lookup dimensions can ever match. `register.js`
// indexes every specific decorator by walking `getRelatedTokens(injectionToken)`,
// which terminates at the abstract token — so the abstract set is non-empty
// iff at least one decorator of this type is registered anywhere.
const EMPTY = Object.freeze([]);

export const getApplicableDecoratorsFor =
  ({ injectMany, injectablesByInjectionToken }) =>
  ({ decoratorToken, target, injectingInjectable }) => {
    const registered = injectablesByInjectionToken.get(decoratorToken);

    if (!registered || registered.size === 0) {
      return EMPTY;
    }

    const out = [
      ...injectMany({
        alias: decoratorToken.for(target),
        instantiationParameters: [],
        injectingInjectable,
      }),
    ];

    for (const t of getRelatedTokens(
      target.injectionToken ?? target.specificTokenOf,
    )) {
      out.push(
        ...injectMany({
          alias: decoratorToken.for(t),
          instantiationParameters: [],
          injectingInjectable,
        }),
      );
    }

    if (target.tags) {
      for (const tag of target.tags) {
        out.push(
          ...injectMany({
            alias: decoratorToken.for(tag),
            instantiationParameters: [],
            injectingInjectable,
          }),
        );
      }
    }

    return out;
  };
