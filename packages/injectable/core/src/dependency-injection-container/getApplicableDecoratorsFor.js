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
export const getApplicableDecoratorsFor =
  ({ injectMany }) =>
  ({ decoratorToken, target, injectingInjectable }) => {
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
