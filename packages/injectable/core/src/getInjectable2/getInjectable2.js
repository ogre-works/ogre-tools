import { injectableSymbol } from '../getInjectable/getInjectable';
import lifecycleEnum2 from '../dependency-injection-container/lifecycleEnum2';

export default ({ lifecycle = lifecycleEnum2.singleton, ...injectable }) => ({
  version: 2,
  aliasType: injectableSymbol,
  lifecycle,
  ...injectable,
});
