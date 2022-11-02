import { injectableSymbol } from './getInjectable';

export default maybeInjectable =>
  maybeInjectable?.aliasType === injectableSymbol;
