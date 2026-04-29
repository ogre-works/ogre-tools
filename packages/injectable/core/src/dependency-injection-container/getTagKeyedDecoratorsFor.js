// Looks up decorators (or callbacks) registered against any tag carried by
// `injectable`. Returns [] when the injectable is untagged or no tag-keyed
// implementations exist.
//
// Used for parity with `for(injectable)` / `for(injectable.injectionToken)`
// dispatch — same shape, different specifier.
export const getTagKeyedDecoratorsFor =
  ({ injectMany }) =>
  ({ token, injectable, injectingInjectable }) => {
    if (!injectable.tags) return EMPTY;

    return injectable.tags.flatMap(tag =>
      injectMany({
        alias: token.for(tag),
        instantiationParameters: [],
        injectingInjectable,
      }),
    );
  };

const EMPTY = [];
