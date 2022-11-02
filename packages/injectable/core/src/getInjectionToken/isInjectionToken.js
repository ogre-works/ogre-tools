import { injectionTokenSymbol } from './getInjectionToken';

export default maybeInjectionToken =>
  maybeInjectionToken?.aliasType === injectionTokenSymbol;
