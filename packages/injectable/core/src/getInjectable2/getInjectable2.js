import getInjectable1 from '../getInjectable/getInjectable';
import lifecycleEnum2 from '../dependency-injection-container/lifecycleEnum2';

export const injectableSymbol = 'injectable';

export default ({ lifecycle = lifecycleEnum2.singleton, ...injectable }) =>
  getInjectable1({
    ...injectable,
    version: 2,
    lifecycle,
  });
