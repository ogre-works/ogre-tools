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
//   3. Tags:     for every tag of the target and of every token in its
//                chain, look up `decoratorToken.for(tag)`. Tags are deduped
//                across these sources: `.for()` children inherit the general
//                token's tags, so the same tag typically occurs on every
//                chain level. This makes a tag on a token fire everywhere
//                `.for(token)` would.
//
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

    const out = [];

    // Most dispatch keys have no registrations — checking the registration
    // index directly skips the injectMany machinery for them. `.for()` itself
    // is cheap on repeat calls (memoized by specifier).
    const dispatch = alias => {
      const registeredForAlias = injectablesByInjectionToken.get(alias);

      if (registeredForAlias && registeredForAlias.size > 0) {
        out.push(
          ...injectMany({
            alias,
            instantiationParameters: [],
            injectingInjectable,
          }),
        );
      }
    };

    dispatch(decoratorToken.for(target));

    const chain = getRelatedTokens(
      target.injectionToken ?? target.specificTokenOf,
    );

    for (const t of chain) {
      dispatch(decoratorToken.for(t));
    }

    const targetTags = target.tags;

    if (targetTags) {
      for (const tag of targetTags) {
        dispatch(decoratorToken.for(tag));
      }
    }

    // Dedup without allocations: `.for()` children share the general token's
    // tags array, so a chain carries at most one distinct tags array — skip
    // repeats by reference, and skip tags already dispatched via target.tags
    // with indexOf (the arrays are tiny).
    let processedChainTags = targetTags;

    for (const t of chain) {
      const chainTags = t.tags;

      if (!chainTags || chainTags === processedChainTags) {
        continue;
      }

      processedChainTags = chainTags;

      for (const tag of chainTags) {
        if (targetTags && targetTags.indexOf(tag) !== -1) {
          continue;
        }

        dispatch(decoratorToken.for(tag));
      }
    }

    return out;
  };
