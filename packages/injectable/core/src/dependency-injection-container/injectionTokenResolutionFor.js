import isInjectionToken from '../getInjectionToken/isInjectionToken';
import { getScopedIdFor } from './getScopedIdFor';

// An `injectionToken` may be given as a function of the scope the injectable
// ends up registered under, `({ scopeIds }) => someToken.for(...)`, for
// tokens keyed by something only the registration knows. A token component is
// callable too, so a resolver is told apart by not being a token itself.
export const isInjectionTokenResolver = maybeResolver =>
  typeof maybeResolver === 'function' && !isInjectionToken(maybeResolver);

// The resolved token lives with the container, not on the injectable: the same
// injectable object registers into different scopes in different containers
// (and, after deregistration, in different scopes of the same one), and each
// registration resolves on its own.
export const injectionTokenResolutionFor = ({
  injectableAndRegistrationContext,
}) => {
  const getScopedId = getScopedIdFor(injectableAndRegistrationContext);
  const resolvedTokenByInjectable = new WeakMap();

  const resolveInjectionTokenOf = (injectable, registrationContext) => {
    const resolver = injectable.injectionToken;

    if (!isInjectionTokenResolver(resolver)) {
      return;
    }

    const owner = registrationContext[registrationContext.length - 1];

    // The owner's scoped id is exactly what the injectable's own `di.scopeIds`
    // will read as once instantiated: the owner's scopes, then the owner.
    const scopeIds =
      !owner || owner.injectable.aliasType === 'container'
        ? []
        : getScopedId(owner.injectable);

    const token = resolver({ scopeIds });

    if (!isInjectionToken(token)) {
      throw new Error(
        `Tried to register injectable "${injectable.id}", but its injection token resolver returned something that is not an injection token.`,
      );
    }

    resolvedTokenByInjectable.set(injectable, token);
  };

  const getInjectionTokenOf = aliasOrInjectable => {
    const tokenOrResolver = aliasOrInjectable.injectionToken;

    return isInjectionTokenResolver(tokenOrResolver)
      ? resolvedTokenByInjectable.get(aliasOrInjectable)
      : tokenOrResolver;
  };

  const forgetInjectionTokenOf = injectable => {
    resolvedTokenByInjectable.delete(injectable);
  };

  return {
    resolveInjectionTokenOf,
    getInjectionTokenOf,
    forgetInjectionTokenOf,
  };
};
