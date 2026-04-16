import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import { storedInstanceKey } from '../dependency-injection-container/lifecycleEnum';
import { getCompositeKey } from '../getCompositeKey/getCompositeKey';

export const injectableSymbol2 = 'injectable2';

export default ({ instantiate, transient = false, ...rest }) => ({
  aliasType: injectableSymbol2,
  instantiate,
  transient,
  lifecycle: transient
    ? lifecycleEnum.transient
    : lifecycleEnum.keyedSingleton({
        getInstanceKey: (di, ...args) => {
          if (args.length === 0) return storedInstanceKey;
          return getCompositeKey(...args);
        },
      }),
  ...rest,
});
