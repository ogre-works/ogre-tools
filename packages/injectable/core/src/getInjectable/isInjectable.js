import { injectableSymbol } from './getInjectable';
import { injectableSymbol2 } from '../getInjectable2/getInjectable2';

export default maybeInjectable =>
  maybeInjectable?.aliasType === injectableSymbol ||
  maybeInjectable?.aliasType === injectableSymbol2;
