import { preInjectCallbackToken } from './tokens';

// Non-wrapping entry hook: fires every pre-inject callback applicable to the
// alias, then calls through. Fires before any resolution or failure check,
// so a callback can register implementations that the same operation then
// observes. `kind` is baked in at wrap time: 'inject' for the inject
// variants, 'injectMany' for the injectMany variants (withMeta variants
// report their base kind).
export const withPreInjectCallbacksFor =
  ({ decoratorCache, getApplicableDecorators }) =>
  kind =>
  toBeCalled =>
  args => {
    // When decoratorCache.preInject is null, a callback was registered or
    // deregistered — invalidate all per-alias cached callback lists.
    if (decoratorCache.preInject === null) {
      decoratorCache.preInject = true;
      decoratorCache.preInjectByAlias = new Map();
    }

    let callbacks = decoratorCache.preInjectByAlias.get(args.alias);

    if (callbacks === undefined) {
      const applicable = getApplicableDecorators({
        decoratorToken: preInjectCallbackToken,
        target: args.alias,
        injectingInjectable: args.injectingInjectable,
      });

      callbacks = applicable.length > 0 ? applicable : null;

      decoratorCache.preInjectByAlias.set(args.alias, callbacks);
    }

    if (callbacks !== null) {
      for (const callback of callbacks) {
        callback(args.alias, kind);
      }
    }

    return toBeCalled(args);
  };
