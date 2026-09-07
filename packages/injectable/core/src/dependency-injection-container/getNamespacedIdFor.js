import isInjectionToken from '../getInjectionToken/isInjectionToken';
import { getScopedIdFor } from './getScopedIdFor';

// The scoped id joined with ':'. An injection token is never registered and
// so has no scopes; its id is parenthesized to tell it apart from an
// injectable's where it stands in as the injecting party.
export const getNamespacedIdFor = injectableAndRegistrationContext => {
  const getScopedId = getScopedIdFor(injectableAndRegistrationContext);

  return alias =>
    isInjectionToken(alias) ? `(${alias.id})` : getScopedId(alias).join(':');
};
