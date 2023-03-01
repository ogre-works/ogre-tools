import isInjectable from '../getInjectable/isInjectable';

export const getRelatedInjectablesFor =
  ({ injectablesByInjectionToken, injectableSet }) =>
  alias =>
    isInjectable(alias)
      ? injectableSet.has(alias)
        ? [alias]
        : []
      : [...(injectablesByInjectionToken.get(alias)?.values() || [])];
