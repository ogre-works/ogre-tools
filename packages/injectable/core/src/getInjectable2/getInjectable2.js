import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import { storedInstanceKey } from '../dependency-injection-container/lifecycleEnum';
import { getCompositeKey } from '../getCompositeKey/getCompositeKey';

export const injectableSymbol2 = 'injectable2';

// Hoisted and shared across every non-transient getInjectable2 — saves a
// per-call lifecycle allocation, and the `_isV2DefaultLifecycle` tag lets
// privateInjectFor skip the getInstanceKey call + key-array allocation when
// a v2 injectable is injected with no args (the common case for
// non-parametric v2). The tag is the *only* signal we trust to bypass
// getInstanceKey because user-provided getInstanceKey may legitimately
// return something other than `storedInstanceKey` for empty args.
const v2DefaultLifecycle = lifecycleEnum.keyedSingleton({
  getInstanceKey: (di, ...args) => {
    if (args.length === 0) return storedInstanceKey;
    return getCompositeKey(...args);
  },
});

v2DefaultLifecycle._isV2DefaultLifecycle = true;

export default ({ instantiate, transient = false, ...rest }) => ({
  aliasType: injectableSymbol2,
  instantiate,
  transient,
  lifecycle: transient ? lifecycleEnum.transient : v2DefaultLifecycle,
  ...rest,
});
