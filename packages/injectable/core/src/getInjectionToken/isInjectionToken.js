import { injectionTokenSymbol } from './getInjectionToken';
import { injectionTokenSymbol2 } from '../getInjectionToken2/getInjectionToken2';

export default maybeInjectionToken =>
  maybeInjectionToken?.aliasType === injectionTokenSymbol ||
  maybeInjectionToken?.aliasType === injectionTokenSymbol2;
