import { injectableBunchSymbol } from './getInjectableBunch';

export default maybeInjectableBunch =>
  maybeInjectableBunch?.aliasType === injectableBunchSymbol;
