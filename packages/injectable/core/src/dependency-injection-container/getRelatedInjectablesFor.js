import isInjectable from '../getInjectable/isInjectable';

export const getRelatedInjectablesFor =
  ({ injectablesByInjectionToken, injectableSet }) =>
  alias => {
    if (isInjectable(alias)) {
      return injectableSet.has(alias) ? [alias] : [];
    } else {
      return [...(injectablesByInjectionToken.get(alias)?.values() || [])];
    }
  };
